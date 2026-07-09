import { ImageResponse } from "next/og";
import { ManifestIcon } from "../lib/manifestIcon";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(<ManifestIcon size={size.width} />, size);
}
