# How maalit-client-web works

This is the web/PWA version of the physical ESP32 "Shabbat elevator" lobby
screens. A user picks a building address and sees that building's 1-3
elevators, each showing its current floor and direction, updating live.

It is a **pure frontend** — there is no backend or database in this repo.
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
pages themselves. All the elevator logic — fetching, polling, computing the
current floor — runs in the user's browser.

## The backend, as this app sees it

| Endpoint | What it returns | How this app uses it |
|---|---|---|
| `GET /addressList` | `[["<Hebrew address>", <numeric building id>], ...]` | Populates the address search on `/` |
| `GET /allConfigScreen?id=&address=` | `{ numOfElevators, file1, file2, file3, ... }` | Tells the elevator page how many tiles to render and which schedule file belongs to each |
| `GET /configScreen?id=&address=&config=file1\|file2\|file3` | Raw text, one floor number per line | Parsed once into a `number[]` "schedule" per elevator |
| `GET /getElevator?address=&elevatorNum=` | A single epoch-seconds number, or `"0"` | Polled every 2 minutes per elevator — this is the "sync point" the floor is computed from |
| `GET /shabbatScreen?id=&address=` | `"1"` or `"0"` | Informational banner only — never blocks the display |

`id` is just any non-empty string this app makes up and remembers in
`localStorage` (`lib/clientId.ts`) — the backend doesn't validate it against
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
   session — it's a fixed recording of that specific elevator's real timing
   (how long it dwells at each floor, how long it takes to travel between
   floors).
2. The backend also tracks a **reference epoch** per elevator — a Unix
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
   `diff` to find the next second where the floor differs — if the schedule
   runs out before finding one, the scan **wraps around** to the start.
   This mirrors the firmware's `compute_next_direction()` exactly, including
   the subtle rule that hitting a `99` stops the forward scan immediately
   (it doesn't skip past gaps).

All of this lives in one dependency-free file, **`lib/elevator/floorCalculation.ts`**,
with no React or fetch code in it at all — it just takes a schedule array,
a reference epoch, and "now," and returns `{ valid, floor, direction, displayText }`.
That's deliberate: it's the one piece of this app where a subtle bug would
be easy to miss and hard to notice visually, so it has its own test suite
(`floorCalculation.test.ts`, run via `npm test`) covering the wrap-around and
"stop at 99" edge cases specifically.

### Why "every 2 minutes" and "every 1 second" separately

- The reference epoch rarely changes and is relatively expensive (a network
  round trip), so it's polled infrequently — 2 minutes, matching the
  firmware's own interval, chosen because that's frequent enough to notice
  if an elevator's cycle restarts.
- The displayed floor changes every second, but computing it from
  `schedule[diff]` is free (no network call) — it's pure arithmetic on data
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
   └─ AddressSearch component ── useAddressList() ── GET /addressList
        │ (user picks an address)
        ▼
app/elevators/[addressId]/page.tsx
   ├─ useClientId()            → the persisted per-browser id
   ├─ useAllConfigScreen()     → GET /allConfigScreen → numOfElevators, file1/2/3
   ├─ useShabbatStatus()       → GET /shabbatScreen (banner only)
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

### Staying correct when the tab is backgrounded

Phones lock/background constantly, and browsers throttle timers when a tab
isn't visible. Every hook that polls or ticks (`useElevatorReferenceEpoch`,
`useElevatorClock`, `useWakeLock`) listens for the page's `visibilitychange`
event and immediately re-syncs the moment the tab becomes visible again,
rather than waiting for its next scheduled interval.

## Wake Lock (keeping the screen on)

`hooks/useWakeLock.ts` calls the browser's Screen Wake Lock API
(`navigator.wakeLock.request('screen')`). Two things worth knowing:

- The browser/OS **always** releases the lock when the tab is backgrounded —
  there is no way to prevent that, only to re-acquire it promptly when the
  tab comes back (which this hook does automatically).
- It's feature-detected. Where it's unsupported (older browsers), the app
  shows a small badge pointing at `/kiosk-help` instead of pretending to
  work — see below for why that page exists.

## The honest limit: `/kiosk-help`

No website — installed as a PWA or not — can stop the OS from switching to
another app, showing a notification on top, or letting someone navigate
away. That's outside what web technology can control on Android or iOS.
This app does the two things that *are* possible (Wake Lock + a manual
Fullscreen button) and, on `/kiosk-help`, gives the actual instructions for
the OS features that genuinely lock a device down:

- **Android Screen Pinning** — a one-time setting, turned on per device.
- **iOS Guided Access** — same idea, passcode-protected.

Both are manual, one-time, per-device setup steps for whoever installs the
phone/tablet as a lobby display — the app cannot turn them on for you.

## PWA

`app/manifest.ts` and the iOS meta tags in `app/layout.tsx` let the site be
installed to a home screen in `standalone` mode (looks like a dedicated
app, no browser chrome). The app icons (`app/icon.tsx`, `app/apple-icon.tsx`,
`app/icon-192|512|512-maskable/route.tsx`) are generated in code via
Next's `ImageResponse` — there are no binary image files to maintain.

There's deliberately **no service worker**. Everything this app shows is
live-polled; a cached offline copy of "what floor the elevator was on" would
be actively misleading, not helpful.

## Deployment

`coolify.json` configures a nixpacks build (Coolify auto-detects Next.js —
no Dockerfile needed), matching how the sibling backend repo is deployed.
The only environment-specific setting is `NEXT_PUBLIC_API_BASE_URL`
(defaults to the real production backend if unset — see `.env.example`).

## Where to look for what

| If you need to change... | Look at |
|---|---|
| The floor/direction math | `lib/elevator/floorCalculation.ts` (+ its test file) |
| How often something is fetched | `lib/constants.ts` |
| A specific backend call | `lib/api/*.ts` (one file per endpoint) |
| Polling/ticking/lifecycle behavior | `hooks/*.ts` |
| What a tile/page looks like | `components/*` and `app/**/page.tsx` + their `.module.css` |
| Kiosk/PWA behavior | `hooks/useWakeLock.ts`, `app/manifest.ts`, `app/kiosk-help/page.tsx` |
