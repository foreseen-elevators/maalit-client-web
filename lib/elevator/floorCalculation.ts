import { INVALID_FLOOR } from "../constants";
import type { Direction, ElevatorDisplayState, FloorSchedule } from "./types";

// Ported 1:1 from the ESP32 firmware's compute_next_direction()
// (screen3.5/main/init_manager.c). Looks ahead in the schedule from the
// current second to find the next floor the display will switch to, and
// reports which way it will move. The schedule loops, so if we run off the
// end of the populated data (or hit an explicit INVALID_FLOOR marker), the
// search wraps around and continues from the beginning.
//
// Returns +1 if that floor is higher (going up), -1 if lower (going down),
// or 0 if there's no further scheduled change (or currentFloor is invalid).
export function computeDirection(
  schedule: FloorSchedule,
  currentIndex: number,
  currentFloor: number,
): Direction {
  if (currentFloor === INVALID_FLOOR) {
    return 0;
  }

  // Phase 1: scan forward from the next second to the end of the schedule.
  for (let j = currentIndex + 1; j < schedule.length; j++) {
    const next = schedule[j];
    if (next === INVALID_FLOOR) {
      break; // no more populated data - wrap around below
    }
    if (next !== currentFloor) {
      return next > currentFloor ? 1 : -1;
    }
  }

  // Phase 2: wrap around and look from the start, up to (not including)
  // the current second.
  for (let j = 0; j < currentIndex; j++) {
    const next = schedule[j];
    if (next === INVALID_FLOOR) {
      break;
    }
    if (next !== currentFloor) {
      return next > currentFloor ? 1 : -1;
    }
  }

  return 0;
}

// Ported from the firmware's counter_task() display formatting
// (screen3.5/main/lvWifi.c): leading zero for single-digit floors (0-9),
// plain number for negative floors or 10+.
export function formatFloorDisplay(floor: number): string {
  if (floor >= 0 && floor <= 9) {
    return String(floor).padStart(2, "0");
  }
  return String(floor);
}

const INVALID_STATE: ElevatorDisplayState = {
  valid: false,
  floor: null,
  direction: 0,
  displayText: "--",
};

// Ported from update_elevator_floors() in init_manager.c. Given an
// elevator's floor schedule, its last known reference epoch (from
// /getElevator), and the current wall-clock second, computes what the
// display should show right now.
export function computeElevatorDisplayState(
  schedule: FloorSchedule,
  referenceEpoch: number | null,
  nowEpochSec: number,
): ElevatorDisplayState {
  if (
    referenceEpoch === null ||
    !Number.isFinite(referenceEpoch) ||
    referenceEpoch <= 0
  ) {
    return INVALID_STATE;
  }

  const diff = nowEpochSec - referenceEpoch;

  if (diff < 0 || diff >= schedule.length) {
    return INVALID_STATE;
  }

  const floor = schedule[diff];
  if (floor === INVALID_FLOOR) {
    return INVALID_STATE;
  }

  const direction = computeDirection(schedule, diff, floor);

  return {
    valid: true,
    floor,
    direction,
    displayText: formatFloorDisplay(floor),
  };
}
