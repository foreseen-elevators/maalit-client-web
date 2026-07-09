import { getText } from "./client";

// GET /shabbatScreen?id=&address= -> "1" (Shabbat/chag right now) or "0".
// Informational only in this app - never used to block the display.
export async function fetchIsShabbat(
  clientId: string,
  addressId: string,
  signal?: AbortSignal,
): Promise<boolean> {
  const text = await getText(
    "/shabbatScreen",
    { id: clientId, address: addressId },
    signal,
  );
  return text.trim() === "1";
}
