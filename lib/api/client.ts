import { API_BASE_URL } from "../constants";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request(
  path: string,
  params: Record<string, string | number>,
  signal?: AbortSignal,
): Promise<string> {
  const url = new URL(path, API_BASE_URL);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }

  let res: Response;
  try {
    res = await fetch(url.toString(), { signal, cache: "no-store" });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw err;
    }
    throw new ApiError(`Network error calling ${path}`);
  }

  if (!res.ok) {
    throw new ApiError(`${path} responded with ${res.status}`, res.status);
  }

  return res.text();
}

export async function getText(
  path: string,
  params: Record<string, string | number>,
  signal?: AbortSignal,
): Promise<string> {
  return request(path, params, signal);
}

export async function getJson<T>(
  path: string,
  params: Record<string, string | number>,
  signal?: AbortSignal,
): Promise<T> {
  const text = await request(path, params, signal);
  return JSON.parse(text) as T;
}
