import Link from "next/link";
import type { WakeLockStatus } from "../../hooks/useWakeLock";
import styles from "./WakeLockIndicator.module.css";

const LABELS: Record<WakeLockStatus, string> = {
  active: "המסך יישאר דלוק",
  inactive: "מתחבר...",
  denied: "לא ניתן למנוע כיבוי מסך - למדריך",
  unsupported: "הדפדפן לא תומך במניעת כיבוי מסך - למדריך",
};

export function WakeLockIndicator({ status }: { status: WakeLockStatus }) {
  const label = LABELS[status];
  const needsHelp = status === "denied" || status === "unsupported";

  if (!needsHelp) {
    return (
      <span className={styles.badge} data-status={status}>
        {label}
      </span>
    );
  }

  return (
    <Link href="/kiosk-help" className={styles.badge} data-status={status}>
      {label}
    </Link>
  );
}
