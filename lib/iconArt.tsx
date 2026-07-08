// Shared visual for all generated app icons (favicon, apple-icon, PWA
// manifest icons). Rendered via next/og's ImageResponse (satori) — no
// binary image assets to generate/maintain, and no emoji/network fetches
// involved, so it's fully reproducible at build time. Kept to plain
// flexbox + solid shapes (no CSS border-triangle tricks or inline <svg>)
// since satori only supports a constrained CSS/HTML subset.
export function IconArt({
  size,
  maskable = false,
}: {
  size: number;
  maskable?: boolean;
}) {
  // Maskable icons need generous padding so Android's adaptive-icon mask
  // doesn't crop the content — keep the glyph inside the ~66% safe zone.
  const contentSize = Math.round(size * (maskable ? 0.6 : 0.86));
  const dotSize = Math.round(contentSize * 0.16);
  const fontSize = Math.round(contentSize * 0.46);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0a0a",
      }}
    >
      <div
        style={{
          width: contentSize,
          height: contentSize,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize,
            background: "#4da3ff",
            marginBottom: Math.round(contentSize * 0.08),
          }}
        />
        <div
          style={{
            display: "flex",
            fontSize,
            fontWeight: 700,
            color: "#f5f5f5",
            lineHeight: 1,
          }}
        >
          05
        </div>
      </div>
    </div>
  );
}
