import type { Direction } from "../../lib/elevator/types";
import styles from "./DirectionArrow.module.css";

// Inline SVG rather than a font glyph - renders identically across
// Android/iOS/desktop regardless of font fallback quirks.
export function DirectionArrow({ direction }: { direction: Direction }) {
  if (direction === 0) {
    return <span className={styles.empty} aria-hidden="true" />;
  }

  const isUp = direction === 1;

  return (
    <svg
      className={styles.arrow}
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      role="img"
      aria-label={isUp ? "עולה" : "יורד"}
    >
      <path
        d={
          isUp
            ? "M12 3 L21 15 L15 15 L15 21 L9 21 L9 15 L3 15 Z"
            : "M12 21 L3 9 L9 9 L9 3 L15 3 L15 9 L21 9 Z"
        }
        fill="currentColor"
      />
    </svg>
  );
}
