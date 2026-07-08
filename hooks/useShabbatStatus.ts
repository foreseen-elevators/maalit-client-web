"use client";

import { useEffect, useState } from "react";
import { fetchIsShabbat } from "../lib/api/shabbatScreen";

const CHECK_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes — informational only

interface ShabbatStatusState {
  isShabbat: boolean | null; // null = not loaded yet
}

// Informational only — used for a small banner, never to gate the display.
export function useShabbatStatus(
  clientId: string,
  addressId: string,
): ShabbatStatusState {
  const [isShabbat, setIsShabbat] = useState<boolean | null>(null);

  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();

    function fetchOnce() {
      fetchIsShabbat(clientId, addressId, controller.signal)
        .then((value) => {
          if (!ignore) setIsShabbat(value);
        })
        .catch(() => {
          // Silently keep the previous value on failure — this is a
          // low-priority banner, not worth surfacing an error for.
        });
    }

    fetchOnce();
    const intervalId = setInterval(fetchOnce, CHECK_INTERVAL_MS);

    return () => {
      ignore = true;
      controller.abort();
      clearInterval(intervalId);
    };
  }, [clientId, addressId]);

  return { isShabbat };
}
