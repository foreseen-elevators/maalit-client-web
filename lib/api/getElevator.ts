import { getText } from "./client";

// GET /getElevator?address=&elevatorNum= -> plain text epoch-seconds
// reference, or "0" meaning "no data yet". Returns null for "no data" /
// unparseable responses so callers can treat this elevator as invalid.
export async function fetchElevatorReferenceEpoch(
  addressId: string,
  elevatorNum: number,
  signal?: AbortSignal,
): Promise<number | null> {
  const text = await getText(
    "/getElevator",
    { address: addressId, elevatorNum },
    signal,
  );
  const value = Number.parseInt(text.trim(), 10);
  if (!Number.isFinite(value) || value <= 0) {
    return null;
  }
  return value;
}
