// index = seconds-offset into the elevator's automatic cycle, value = floor
// number at that second (or INVALID_FLOOR for "no data").
export type FloorSchedule = number[];

export type Direction = 1 | -1 | 0;

export interface ElevatorDisplayState {
  valid: boolean;
  floor: number | null;
  direction: Direction;
  displayText: string;
}
