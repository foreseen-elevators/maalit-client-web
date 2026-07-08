import { getText } from "./client";
import { INVALID_FLOOR } from "../constants";

// GET /configScreen?id=&address=&config=file1|file2|file3 -> raw text, one
// floor number per line; line index = seconds-offset into the elevator's
// automatic Shabbat cycle.
export async function fetchScheduleFile(
  clientId: string,
  addressId: string,
  fileKey: "file1" | "file2" | "file3",
  signal?: AbortSignal,
): Promise<string> {
  return getText(
    "/configScreen",
    { id: clientId, address: addressId, config: fileKey },
    signal,
  );
}

export function parseFloorSchedule(text: string): number[] {
  return text
    .split(/\r\n|\r|\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      const value = Number.parseInt(line, 10);
      return Number.isFinite(value) ? value : INVALID_FLOOR;
    });
}
