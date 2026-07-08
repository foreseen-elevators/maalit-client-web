import { CLIENT_ID_STORAGE_KEY } from "./constants";

function randomId(): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let out = "";
  for (let i = 0; i < 8; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

// The backend just needs any non-empty, stable-per-browser string for its
// `id` query param (it's the "device id" concept borrowed from the physical
// screens — not validated against a registry for the routes this app uses).
export function getClientId(): string {
  if (typeof window === "undefined") {
    return "server";
  }

  try {
    const existing = window.localStorage.getItem(CLIENT_ID_STORAGE_KEY);
    if (existing) {
      return existing;
    }
    const id = randomId();
    window.localStorage.setItem(CLIENT_ID_STORAGE_KEY, id);
    return id;
  } catch {
    // localStorage unavailable (private mode, disabled storage, etc.) —
    // fall back to a per-session id so requests still work.
    return randomId();
  }
}
