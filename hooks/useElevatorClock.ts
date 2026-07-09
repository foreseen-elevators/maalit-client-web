"use client";

import { useEffect, useState } from "react";
import { computeElevatorDisplayState } from "../lib/elevator/floorCalculation";
import type { ElevatorDisplayState, FloorSchedule } from "../lib/elevator/types";

const LOADING_STATE: ElevatorDisplayState = {
  valid: false,
  floor: null,
  direction: 0,
  displayText: "--",
};

// Ticks once a second and recomputes the display from the current
// wall-clock time (never a naive incrementing counter), so the number
// self-corrects with no drift after the tab was throttled/backgrounded.
// Also recomputes immediately when the tab regains visibility, rather than
// waiting up to 999ms for the next scheduled tick.
export function useElevatorClock(
  schedule: FloorSchedule | null,
  referenceEpoch: number | null,
): ElevatorDisplayState {
  const [state, setState] = useState<ElevatorDisplayState>(LOADING_STATE);

  useEffect(() => {
    if (!schedule) {
      // Nothing to subscribe to yet - the render-time check below already
      // reports LOADING_STATE while schedule is null, so there's nothing to
      // do here.
      return;
    }
    const activeSchedule = schedule;

    function tick() {
      const nowSec = Math.floor(Date.now() / 1000);
      setState(computeElevatorDisplayState(activeSchedule, referenceEpoch, nowSec));
    }

    tick();
    const intervalId = setInterval(tick, 1000);

    function onVisibilityChange() {
      if (document.visibilityState === "visible") tick();
    }
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [schedule, referenceEpoch]);

  if (!schedule) return LOADING_STATE;
  return state;
}
