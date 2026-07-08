import { describe, expect, it } from "vitest";
import {
  computeDirection,
  computeElevatorDisplayState,
  formatFloorDisplay,
} from "./floorCalculation";
import { INVALID_FLOOR } from "../constants";

describe("formatFloorDisplay", () => {
  it("zero-pads single digit floors", () => {
    expect(formatFloorDisplay(0)).toBe("00");
    expect(formatFloorDisplay(5)).toBe("05");
    expect(formatFloorDisplay(9)).toBe("09");
  });

  it("shows 10+ and negative floors as plain numbers", () => {
    expect(formatFloorDisplay(10)).toBe("10");
    expect(formatFloorDisplay(15)).toBe("15");
    expect(formatFloorDisplay(-5)).toBe("-5");
  });
});

describe("computeDirection", () => {
  it("returns 0 when the floor never changes", () => {
    const schedule = [3, 3, 3, 3, 3];
    expect(computeDirection(schedule, 0, 3)).toBe(0);
  });

  it("returns 0 immediately for an invalid current floor", () => {
    const schedule = [1, 2, INVALID_FLOOR, 4];
    expect(computeDirection(schedule, 0, INVALID_FLOOR)).toBe(0);
  });

  it("finds an upward change scanning forward", () => {
    const schedule = [3, 3, 5, 5];
    expect(computeDirection(schedule, 0, 3)).toBe(1);
  });

  it("finds a downward change scanning forward", () => {
    const schedule = [5, 5, 2, 2];
    expect(computeDirection(schedule, 0, 5)).toBe(-1);
  });

  it("stops the forward scan at an INVALID_FLOOR marker instead of reading past it", () => {
    // If phase 1 just kept scanning past the 99, it would find the 8 and
    // wrongly report "up" instead of wrapping.
    const schedule = [3, 3, INVALID_FLOOR, 8];
    expect(computeDirection(schedule, 0, 3)).toBe(0);
  });

  it("wraps around to the start when nothing differs before the end", () => {
    const schedule = [1, 4, 4, 4];
    // currentIndex=1, currentFloor=4: phase 1 (indices 2,3) finds nothing,
    // phase 2 wraps to index 0 which is 1 (lower) -> down.
    expect(computeDirection(schedule, 1, 4)).toBe(-1);
  });

  it("wraps around and finds an upward change", () => {
    const schedule = [9, 4, 4, 4];
    expect(computeDirection(schedule, 1, 4)).toBe(1);
  });

  it("returns 0 if the wrap also finds nothing before currentIndex", () => {
    const schedule = [4, 4, 4, 4];
    expect(computeDirection(schedule, 2, 4)).toBe(0);
  });

  it("handles currentIndex at the very last position (phase 1 is empty)", () => {
    const schedule = [1, 2, 3];
    // currentIndex = length-1, phase 1 loop body never runs, must wrap.
    expect(computeDirection(schedule, 2, 3)).toBe(-1);
  });

  it("stops the wrap scan at an INVALID_FLOOR marker too", () => {
    const schedule = [INVALID_FLOOR, 9, 5, 5];
    // currentIndex=3, currentFloor=5: phase 1 empty, phase 2 scans j=0..2,
    // hits INVALID_FLOOR at j=0 first and must break immediately.
    expect(computeDirection(schedule, 3, 5)).toBe(0);
  });
});

describe("computeElevatorDisplayState", () => {
  const schedule = [0, 1, 1, 2, 2, 3];

  it("is invalid when referenceEpoch is null", () => {
    expect(computeElevatorDisplayState(schedule, null, 1000).valid).toBe(
      false,
    );
  });

  it("is invalid when referenceEpoch is 0 or negative", () => {
    expect(computeElevatorDisplayState(schedule, 0, 1000).valid).toBe(false);
    expect(computeElevatorDisplayState(schedule, -5, 1000).valid).toBe(false);
  });

  it("is invalid when diff is negative (clock behind the reference)", () => {
    expect(computeElevatorDisplayState(schedule, 1000, 999).valid).toBe(
      false,
    );
  });

  it("is invalid when diff runs past the end of the schedule", () => {
    expect(
      computeElevatorDisplayState(schedule, 1000, 1000 + schedule.length)
        .valid,
    ).toBe(false);
  });

  it("is invalid when the schedule value at diff is INVALID_FLOOR", () => {
    const withGap = [0, 1, INVALID_FLOOR, 2];
    expect(computeElevatorDisplayState(withGap, 1000, 1002).valid).toBe(
      false,
    );
  });

  it("returns the correct floor, direction and display text", () => {
    const state = computeElevatorDisplayState(schedule, 1000, 1003);
    expect(state.valid).toBe(true);
    expect(state.floor).toBe(2);
    expect(state.displayText).toBe("02");
    expect(state.direction).toBe(1); // schedule[4]=2, schedule[5]=3 -> up
  });

  it("formats negative/10+ floors without padding in the combined state", () => {
    const bigSchedule = [15, 15, -5];
    expect(computeElevatorDisplayState(bigSchedule, 1000, 1000).displayText).toBe(
      "15",
    );
    expect(computeElevatorDisplayState(bigSchedule, 1000, 1002).displayText).toBe(
      "-5",
    );
  });
});
