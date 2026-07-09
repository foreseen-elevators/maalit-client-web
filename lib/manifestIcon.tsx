import { getIconDataUri } from "./iconSource";

// Renders the app logo into a square canvas for the PWA manifest icons.
// Maskable icons need generous padding so Android's adaptive-icon mask
// doesn't crop the candle flames / wifi arcs at the edges of the source
// artwork.
export function ManifestIcon({
  size,
  maskable = false,
}: {
  size: number;
  maskable?: boolean;
}) {
  const contentSize = Math.round(size * (maskable ? 0.6 : 1));

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#ffffff",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={getIconDataUri()}
        width={contentSize}
        height={contentSize}
        alt=""
      />
    </div>
  );
}
