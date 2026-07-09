import { ImageResponse } from "next/og";
import { ManifestIcon } from "../../lib/manifestIcon";

const size = { width: 192, height: 192 };

export async function GET() {
  return new ImageResponse(<ManifestIcon size={size.width} />, size);
}
