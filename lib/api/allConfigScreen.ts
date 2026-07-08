import { getJson } from "./client";

export interface AllConfigScreenResponse {
  numOfElevators: string;
  file1?: string;
  file2?: string;
  file3?: string;
  elevator?: string;
  image?: string;
  [key: string]: string | undefined;
}

// GET /allConfigScreen?id=&address= -> per-building config, including how
// many elevators this building has (1-3) and which schedule file each uses.
export async function fetchAllConfigScreen(
  clientId: string,
  addressId: string,
  signal?: AbortSignal,
): Promise<AllConfigScreenResponse> {
  return getJson<AllConfigScreenResponse>(
    "/allConfigScreen",
    { id: clientId, address: addressId },
    signal,
  );
}

export function elevatorCountFrom(config: AllConfigScreenResponse): number {
  const n = Number.parseInt(config.numOfElevators, 10);
  if (!Number.isFinite(n) || n < 1) return 0;
  return Math.min(n, 3);
}

export function fileKeyForElevator(index: number): "file1" | "file2" | "file3" {
  return (["file1", "file2", "file3"] as const)[index];
}
