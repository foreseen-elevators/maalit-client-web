import { ImageResponse } from "next/og";
import { ManifestIcon } from "../../lib/manifestIcon";

const size = { width: 512, height: 512 };

export async function GET() {
  return new ImageResponse(<ManifestIcon size={size.width} maskable />, size);
}
