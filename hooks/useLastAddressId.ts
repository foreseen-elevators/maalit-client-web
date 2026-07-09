"use client";

import { useSyncExternalStore } from "react";
import { getLastAddressId } from "../lib/lastAddress";

const noopSubscribe = () => () => {};

// Same lint/SSR-safe pattern as useClientId — reads a client-only value
// (localStorage) without an effect+setState round trip. The server
// snapshot is always null (nothing to redirect to during SSR), and the
// real value (if any) appears on the client shortly after hydration.
export function useLastAddressId(): string | null {
  return useSyncExternalStore(noopSubscribe, getLastAddressId, () => null);
}
