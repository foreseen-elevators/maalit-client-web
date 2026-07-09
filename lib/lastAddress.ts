import { LAST_ADDRESS_STORAGE_KEY } from "./constants";

export function getLastAddressId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(LAST_ADDRESS_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setLastAddressId(id: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LAST_ADDRESS_STORAGE_KEY, id);
  } catch {
    // localStorage unavailable (private mode, disabled storage, etc.) —
    // remembering the last address is a convenience, not essential.
  }
}
