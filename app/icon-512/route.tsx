import { ImageResponse } from "next/og";
import { IconArt } from "../../lib/iconArt";

const size = { width: 512, height: 512 };

export async function GET() {
  return new ImageResponse(<IconArt size={size.width} />, size);
}
