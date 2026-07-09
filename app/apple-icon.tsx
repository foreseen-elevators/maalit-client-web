import { ImageResponse } from "next/og";
import { ManifestIcon } from "../lib/manifestIcon";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(<ManifestIcon size={size.width} />, size);
}
