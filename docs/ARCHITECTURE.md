# How maalit-client-web works

This is the web/PWA version of the physical ESP32 "Shabbat elevator" lobby
screens. A user picks a building address and sees that building's 1-3
elevators, each showing its current floor and direction, updating live.

It is a **pure frontend** - there is no backend or database in this repo.
Every piece of data comes from an existing, already-deployed backend
(`first-http-node-coolify`, at `https://first-app.055449264.xyz`), called
directly from the browser.

## Why this exists

On Shabbat/chag, building elevators are switched into an automatic mode:
they loop continuously, stopping at every floor for a fixed dwell time, with
no buttons to press (observant Jews can't operate switches on Shabbat). The
physical ESP32 lobby screens (`../../screen3.5`) show which floor the
elevator is on right now so people don't have to guess/wait blindly. This
project is the same display, but reachable from any phone/tablet/PC, and
installable as a kiosk-style PWA.

## The big picture

```
 ┌─────────────┐        ┌──────────────────────────┐
 │   Browser   │  HTTP  │  first-http-node-coolify  │
 │ (this app)  │───────▶│  (already deployed,       │
 │             │◀───────│   not part of this repo)  │
 └─────────────┘        └──────────────────────────┘
```

There's no server-side code here beyond what Next.js needs to serve the
pages themselves. All the elevator logic - fetching, polling, computing the
current floor - runs in the user's browser.

## The backend, as this app sees it

| Endpoint | What it returns | How this app uses it |
|---|---|---|
| `GET /addressList` | `[["<Hebrew address>", <numeric building id>], ...]` | Populates the address search on `/` |
| `GET /allConfigScreen?id=&address=` | `{ numOfElevators, file1, file2, file3, ... }` | Tells the elevator page how many tiles to render and which schedule file belongs to each |
| `GET /configScreen?id=&address=&config=file1\|file2\|file3` | Raw text, one floor number per line | Parsed once into a `number[]` "schedule" per elevator |
| `GET /getElevator?address=&elevatorNum=` | A single epoch-seconds number, or `"0"` | Polled every 2 minutes per elevator - this is the "sync point" the floor is computed from |
| `GET /shabbatScreen?id=&address=` | `"1"` or `"0"` | Informational banner only - never blocks the display |

`id` is just any non-empty string this app makes up and remembers in
`localStorage` (`lib/clientId.ts`) - the backend doesn't validate it against
a registry for these routes.

None of this is authenticated. It's the same public, CORS-open API the
physical screens already call.

## The core idea: how a "floor number" gets computed

This is the part that matters most, and it's a direct port of the ESP32
firmware's logic (`screen3.5/main/init_manager.c` and `lvWifi.c`), not
something invented for the web.

1. Each elevator has a **schedule**: a big list of floor numbers, one per
   second, e.g. `[0, 1, 1, 2, 2, 3, 4, 4, 5, ...]`. Index 5 in that array is
   "what floor the elevator is on 5 seconds into its cycle." This schedule
   is downloaded once from `/configScreen` and never changes during a
   session - it's a fixed recording of that specific elevator's real timing
   (how long it dwells at each floor, how long it takes to travel between
   floors).
2. The backend also tracks a **reference epoch** per elevator - a Unix
   timestamp marking when "second 0" of the current cycle happened. This
   app fetches it via `/getElevator` **every 2 minutes** (matching the
   firmware's `TIME_FETCH_INTERVAL_SEC = 120`).
3. Every second, the app computes:
   ```
   diff = now (unix seconds) - referenceEpoch
   floor = schedule[diff]
   ```
   If `diff` is negative, past the end of the schedule, or the schedule
   value is the special marker `99` ("no data"), the tile shows `"--"`
   instead of a number.
4. The up/down arrow is computed by scanning forward in the schedule from
   `diff` to find the next second where the floor differs - if the schedule
   runs out before finding one, the scan **wraps around** to the start.
   This mirrors the firmware's `compute_next_direction()` exactly, including
   the subtle rule that hitting a `99` stops the forward scan immediately
   (it doesn't skip past gaps).

All of this lives in one dependency-free file, **`lib/elevator/floorCalculation.ts`**,
with no React or fetch code in it at all - it just takes a schedule array,
a reference epoch, and "now," and returns `{ valid, floor, direction, displayText }`.
That's deliberate: it's the one piece of this app where a subtle bug would
be easy to miss and hard to notice visually, so it has its own test suite
(`floorCalculation.test.ts`, run via `npm test`) covering the wrap-around and
"stop at 99" edge cases specifically.

### Why "every 2 minutes" and "every 1 second" separately

- The reference epoch rarely changes and is relatively expensive (a network
  round trip), so it's polled infrequently - 2 minutes, matching the
  firmware's own interval, chosen because that's frequent enough to notice
  if an elevator's cycle restarts.
- The displayed floor changes every second, but computing it from
  `schedule[diff]` is free (no network call) - it's pure arithmetic on data
  already in memory.
- The 1-second tick always recomputes `diff` from the actual current
  wall-clock time (`Date.now()`), never from an incrementing counter. That
  makes it self-correcting: if the browser tab is backgrounded and timers
  get throttled or paused, the very next tick after the tab becomes visible
  again shows the mathematically correct floor for that moment, with no
  drift to fix.

## Data flow through the code

```
app/page.tsx (address search)
   ├─ useLastAddressId()       → localStorage: redirect straight to the
   │                             last-viewed address, unless ?change=1
   └─ AddressSearch component ── useAddressList() ── GET /addressList
        │ (user picks an address)
        ▼
app/elevators/[addressId]/page.tsx
   ├─ useClientId()            → the persisted per-browser id
   ├─ useAllConfigScreen()     → GET /allConfigScreen → numOfElevators, file1/2/3
   ├─ useAddressList()         → looked up again here to show the address's
   │                             name (in the footer, next to "בחירת כתובת אחרת")
   ├─ setLastAddressId()       → called once config loads successfully, so
   │                             both picking an address AND visiting a
   │                             direct/bookmarked link remember it
   ├─ useShabbatStatus()       → GET /shabbatScreen → ShabbatBanner
   ├─ useWakeLock()            → keeps the screen on
   └─ ElevatorGrid (1-3 tiles)
        └─ ElevatorTile (one per elevator, fully independent)
             ├─ useElevatorSchedule()        → GET /configScreen (once)
             ├─ useElevatorReferenceEpoch()  → GET /getElevator (every 2 min)
             └─ useElevatorClock()           → 1s tick → floorCalculation.ts
```

Each `ElevatorTile` owns its entire data lifecycle independently. That's
intentional: with 3 tiles polling and ticking, nothing about one elevator's
update should force the other two to re-render or refetch.

### Remembering the last address

`lib/lastAddress.ts` persists the last successfully-loaded address id to
`localStorage`, read back via `hooks/useLastAddressId.ts` (the same
`useSyncExternalStore` pattern as `useClientId` — see below). `app/page.tsx`
uses it to skip the address picker entirely and redirect straight to
`/elevators/<id>` for a returning visitor.

That auto-redirect needs an escape hatch, or clicking "בחירת כתובת אחרת"
(choose a different address) would just bounce back to the same address
immediately. `/?change=1` is that escape hatch — the elevator page's "choose
a different address" link points there instead of plain `/`, and the
landing page skips the redirect whenever that query param is present.

### Staying correct when the tab is backgrounded

Phones lock/background constantly, and browsers throttle timers when a tab
isn't visible. Every hook that polls or ticks (`useElevatorReferenceEpoch`,
`useElevatorClock`, `useWakeLock`) listens for the page's `visibilitychange`
event and immediately re-syncs the moment the tab becomes visible again,
rather than waiting for its next scheduled interval.

## Shabbat banner and the floor-accuracy disclaimer

`ShabbatBanner` shares one banner slot at the top of the elevator display,
and shows one of two messages depending on live `/shabbatScreen` status —
never used to gate or block the display itself:

- **During Shabbat/chag**: a bold red reminder not to touch the phone
  (`אסור לגעת במסך במהלך השבת`) — this app is meant to be glanced at on a
  pre-positioned device, not interacted with, during Shabbat itself.
- **Not currently Shabbat/chag**: a muted note that the elevator may be back
  in normal (button-operated) service and the display may not reflect that.

Separately, `Disclaimer` (`components/Disclaimer/Disclaimer.tsx`) is always
visible under the elevator tiles, regardless of Shabbat status — it explains
that the floor number is a computed estimate, not a direct reading from the
elevator controller, and encourages waiting a moment rather than trusting it
to the second. This is deliberately unrelated to `/kiosk-help` (a different
concern — data accuracy vs. device lockdown) and doesn't link there.

## Wake Lock (keeping the screen on)

`hooks/useWakeLock.ts` calls the browser's Screen Wake Lock API
(`navigator.wakeLock.request('screen')`). Two things worth knowing:

- The browser/OS **always** releases the lock when the tab is backgrounded -
  there is no way to prevent that, only to re-acquire it promptly when the
  tab comes back (which this hook does automatically).
- It's feature-detected. Where it's unsupported or denied, the
  `WakeLockIndicator` badge itself links to `/kiosk-help`. There's also an
  always-visible "הגדרת מסך קבוע" link in the elevator page's footer —
  Wake Lock working fine doesn't mean Screen Pinning/Guided Access aren't
  still useful for whoever is setting up a permanently-mounted lobby
  device, so that link isn't conditioned on Wake Lock status at all.

## The honest limit: `/kiosk-help`

No website - installed as a PWA or not - can stop the OS from switching to
another app, showing a notification on top, or letting someone navigate
away. That's outside what web technology can control on Android or iOS.
This app does the two things that *are* possible (Wake Lock + a manual
Fullscreen button) and, on `/kiosk-help`, gives the actual instructions for
the OS features that genuinely lock a device down:

- **Android Screen Pinning** - a one-time setting, turned on per device.
- **iOS Guided Access** - same idea, passcode-protected.

Both are manual, one-time, per-device setup steps for whoever installs the
phone/tablet as a lobby display - the app cannot turn them on for you.

## PWA

`app/manifest.ts` and the iOS meta tags in `app/layout.tsx` let the site be
installed to a home screen in `standalone` mode (looks like a dedicated
app, no browser chrome). The app icons (`app/icon.tsx`, `app/apple-icon.tsx`,
`app/icon-192|512|512-maskable/route.tsx`) are all generated at the exact
size each context needs via Next's `ImageResponse`, rendering the one
source logo (`public/icon-source.png`, read via `lib/iconSource.ts`) through
`lib/manifestIcon.tsx` — the 512 maskable variant adds safe-zone padding so
Android's adaptive-icon mask doesn't crop it. There's only the one binary
asset to maintain; every size is derived from it in code.

There's deliberately **no service worker**. Everything this app shows is
live-polled; a cached offline copy of "what floor the elevator was on" would
be actively misleading, not helpful.

## Deployment

`coolify.json` configures a nixpacks build (Coolify auto-detects Next.js -
no Dockerfile needed), matching how the sibling backend repo is deployed.
The only environment-specific setting is `NEXT_PUBLIC_API_BASE_URL`
(defaults to the real production backend if unset - see `.env.example`).

## Where to look for what

| If you need to change... | Look at |
|---|---|
| The floor/direction math | `lib/elevator/floorCalculation.ts` (+ its test file) |
| How often something is fetched | `lib/constants.ts` |
| A specific backend call | `lib/api/*.ts` (one file per endpoint) |
| Polling/ticking/lifecycle behavior | `hooks/*.ts` |
| What a tile/page looks like | `components/*` and `app/**/page.tsx` + their `.module.css` |
| Kiosk/PWA behavior | `hooks/useWakeLock.ts`, `app/manifest.ts`, `app/kiosk-help/page.tsx` |
| App icons | `public/icon-source.png`, `lib/iconSource.ts`, `lib/manifestIcon.tsx` |
| Remembering/redirecting to the last address | `lib/lastAddress.ts`, `hooks/useLastAddressId.ts`, `app/page.tsx` |
| The Shabbat banner or floor-accuracy disclaimer wording | `components/ShabbatBanner/`, `components/Disclaimer/` |
