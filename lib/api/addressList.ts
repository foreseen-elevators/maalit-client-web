import { getJson } from "./client";

export interface AddressEntry {
  name: string;
  id: number;
}

// GET /addressList -> [["<hebrew address>", <numeric building id>], ...]
export async function fetchAddressList(
  signal?: AbortSignal,
): Promise<AddressEntry[]> {
  const raw = await getJson<[string, number][]>("/addressList", {}, signal);
  return raw.map(([name, id]) => ({ name, id }));
}
