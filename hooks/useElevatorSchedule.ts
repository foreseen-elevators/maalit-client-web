"use client";

import { useEffect, useState } from "react";
import { fetchScheduleFile, parseFloorSchedule } from "../lib/api/configScreen";
import type { FloorSchedule } from "../lib/elevator/types";

interface ScheduleState {
  key: string;
  schedule: FloorSchedule | null;
  error: string | null;
}

const EMPTY: ScheduleState = { key: "", schedule: null, error: null };

// The schedule file never changes for a given building/elevator during a
// session, so this fetches once per (addressId, fileKey) and is otherwise
// static - no polling needed here (that's useElevatorReferenceEpoch's job).
export function useElevatorSchedule(
  clientId: string,
  addressId: string,
  fileKey: "file1" | "file2" | "file3",
): { schedule: FloorSchedule | null; loading: boolean; error: string | null } {
  const key = `${clientId}:${addressId}:${fileKey}`;
  const [state, setState] = useState<ScheduleState>(EMPTY);

  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();
    const requestKey = `${clientId}:${addressId}:${fileKey}`;

    fetchScheduleFile(clientId, addressId, fileKey, controller.signal)
      .then((text) => {
        if (ignore) return;
        setState({ key: requestKey, schedule: parseFloorSchedule(text), error: null });
      })
      .catch((err) => {
        if (ignore) return;
        if (err instanceof DOMException && err.name === "AbortError") return;
        setState({ key: requestKey, schedule: null, error: "שגיאה בטעינת נתוני המעלית" });
      });

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [clientId, addressId, fileKey]);

  const loading = state.key !== key;

  return {
    schedule: loading ? null : state.schedule,
    loading,
    error: loading ? null : state.error,
  };
}
