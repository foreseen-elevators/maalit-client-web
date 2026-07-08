"use client";

import { useSyncExternalStore } from "react";
import { getClientId } from "../lib/clientId";

// The id never changes after creation, so no real subscription is needed —
// useSyncExternalStore just gives us a lint/SSR-safe way to read a
// client-only value (localStorage) without an effect+setState round trip,
// and without a hydration mismatch (the server snapshot is a stable
// placeholder that's never actually used for a request, since data
// fetching only happens client-side in effects).
const noopSubscribe = () => () => {};

export function useClientId(): string {
  return useSyncExternalStore(
    noopSubscribe,
    getClientId,
    () => "server",
  );
}
