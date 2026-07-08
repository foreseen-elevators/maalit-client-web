"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type WakeLockStatus = "unsupported" | "active" | "inactive" | "denied";

interface WakeLockState {
  status: WakeLockStatus;
  request: () => void;
}

// Acquires navigator.wakeLock.request('screen') to keep the display from
// sleeping, and re-acquires it whenever the tab becomes visible again — the
// spec/browsers release the lock automatically on backgrounding, and that
// cannot be prevented, only promptly recovered from.
export function useWakeLock(): WakeLockState {
  const supported =
    typeof navigator !== "undefined" && "wakeLock" in navigator;
  const [status, setStatus] = useState<WakeLockStatus>(
    supported ? "inactive" : "unsupported",
  );
  const sentinelRef = useRef<WakeLockSentinel | null>(null);

  const request = useCallback(() => {
    if (!supported) return;
    navigator.wakeLock
      .request("screen")
      .then((sentinel) => {
        sentinelRef.current = sentinel;
        setStatus("active");
        sentinel.addEventListener("release", () => {
          sentinelRef.current = null;
          setStatus("inactive");
        });
      })
      .catch(() => {
        setStatus("denied");
      });
  }, [supported]);

  useEffect(() => {
    if (!supported) return;
    request();

    function onVisibilityChange() {
      if (document.visibilityState === "visible" && !sentinelRef.current) {
        request();
      }
    }
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      sentinelRef.current?.release().catch(() => {});
      sentinelRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supported]);

  return { status, request };
}
