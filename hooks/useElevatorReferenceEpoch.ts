"use client";

import { useEffect, useState } from "react";
import { fetchElevatorReferenceEpoch } from "../lib/api/getElevator";
import { CONN_OK_THRESHOLD_MS, TIME_FETCH_INTERVAL_MS } from "../lib/constants";

interface ReferenceEpochState {
  referenceEpoch: number | null;
  lastFetchedAt: number | null; // Date.now() of the last successful response
  loading: boolean;
}

// Polls GET /getElevator every 2 minutes (matching the physical ESP32
// screens' TIME_FETCH_INTERVAL_SEC), fetches once immediately on mount, and
// re-syncs right away whenever the tab becomes visible again rather than
// waiting for the next scheduled tick (phones get backgrounded/locked
// constantly).
export function useElevatorReferenceEpoch(
  addressId: string,
  elevatorIndex: number,
): ReferenceEpochState & { isStale: boolean } {
  const [state, setState] = useState<ReferenceEpochState>({
    referenceEpoch: null,
    lastFetchedAt: null,
    loading: true,
  });
  const [isStale, setIsStale] = useState(false);

  useEffect(() => {
    let ignore = false;
    let inFlight: AbortController | null = null;

    async function fetchOnce() {
      inFlight?.abort();
      const controller = new AbortController();
      inFlight = controller;
      try {
        const epoch = await fetchElevatorReferenceEpoch(
          addressId,
          elevatorIndex,
          controller.signal,
        );
        if (ignore) return;
        setState({ referenceEpoch: epoch, lastFetchedAt: Date.now(), loading: false });
      } catch (err) {
        if (ignore) return;
        if (err instanceof DOMException && err.name === "AbortError") return;
        // Leave the previous referenceEpoch in place on a transient failure —
        // the tick will keep using the last known-good value.
        setState((prev) => ({ ...prev, loading: false }));
      }
    }

    fetchOnce();
    const intervalId = setInterval(fetchOnce, TIME_FETCH_INTERVAL_MS);

    function onVisibilityChange() {
      if (document.visibilityState === "visible") {
        fetchOnce();
      }
    }
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      ignore = true;
      inFlight?.abort();
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [addressId, elevatorIndex]);

  // Staleness depends on wall-clock time passing, not just on state changes,
  // so it needs its own periodic re-check — done here (inside an effect's
  // interval callback) rather than computed impurely at render time.
  useEffect(() => {
    function check() {
      setIsStale(
        state.lastFetchedAt !== null &&
          Date.now() - state.lastFetchedAt > CONN_OK_THRESHOLD_MS,
      );
    }
    check();
    const intervalId = setInterval(check, 5000);
    return () => clearInterval(intervalId);
  }, [state.lastFetchedAt]);

  return { ...state, isStale };
}
