import { readFileSync } from "fs";
import { join } from "path";

let cached: string | null = null;

// The logo (elevator doors + Shabbat candles + wifi signal) as a data URI,
// for embedding in generated icon routes via next/og's ImageResponse.
// Read once from public/icon-source.png and cached in memory.
export function getIconDataUri(): string {
  if (!cached) {
    const bytes = readFileSync(join(process.cwd(), "public", "icon-source.png"));
    cached = `data:image/png;base64,${bytes.toString("base64")}`;
  }
  return cached;
}
