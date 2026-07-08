// Mirrors the constants used by the physical ESP32 lobby screens
// (screen3.5/main/globals.h and init_manager.c) so the web client
// replicates the exact same timing/behavior.

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://first-app.055449264.xyz";

export const MAX_ELEVATORS = 3;

// A floor value of 99 marks "no data at this position" in the schedule file.
export const INVALID_FLOOR = 99;

// How often to re-fetch each elevator's reference epoch from /getElevator.
export const TIME_FETCH_INTERVAL_MS = 120_000;

// If the last successful /getElevator response is older than this, the
// tile shows a staleness indicator rather than silently trusting old data.
export const CONN_OK_THRESHOLD_MS = 150_000;

export const CLIENT_ID_STORAGE_KEY = "maalit-client-id";

export const LAST_ADDRESS_STORAGE_KEY = "maalit-last-address-id";
