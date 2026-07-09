# maalit-client-web

Web (PWA) version of the physical ESP32 Shabbat-elevator lobby screens
(`screen3.5`). Lets anyone pick a building address and see 1-3 elevators'
live floor position, from a phone, tablet, or PC.

This is a **pure frontend** - no backend or database of its own. It calls
the existing Maalit backend (`first-http-node-coolify`, deployed on
Coolify) directly from the browser, and replicates the exact floor/direction
algorithm used by the physical screens (see `lib/elevator/floorCalculation.ts`,
ported from `screen3.5/main/init_manager.c` and `lvWifi.c`).

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for a full explanation of
how it works, including the floor/direction algorithm, data flow, and why
things are structured the way they are.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000. By default it talks to the real production
backend at `https://first-app.055449264.xyz` - see `.env.example` for how to
point it elsewhere via `NEXT_PUBLIC_API_BASE_URL`.

## Tests

```bash
npm test
```

Unit tests cover `lib/elevator/floorCalculation.ts` - the ported
floor/direction algorithm - since it's the correctness-critical piece of
this app.

## Project layout

- `lib/api/` - one wrapper per backend endpoint (`/addressList`,
  `/allConfigScreen`, `/configScreen`, `/getElevator`, `/shabbatScreen`).
- `lib/elevator/floorCalculation.ts` - pure, dependency-free port of the
  firmware's floor/direction logic.
- `hooks/` - React data lifecycle: schedule fetch (once), reference-epoch
  polling (every 2 minutes, matching the physical screens), and the 1-second
  display tick (wall-clock driven, self-correcting after tab throttling).
- `components/` - `AddressSearch` (RTL typeahead), `ElevatorGrid`/`ElevatorTile`
  (responsive 1-3 elevator display), `WakeLockIndicator`, `ShabbatBanner`.
- `app/kiosk-help` - honest instructions for the OS-level lockdown a website
  cannot do on its own (Android Screen Pinning, iOS Guided Access).

## Deployment (Coolify)

`coolify.json` configures a nixpacks build (no Dockerfile needed - Next.js
is auto-detected). Set `NEXT_PUBLIC_API_BASE_URL` in the Coolify app's
environment if it should point somewhere other than the production backend.
