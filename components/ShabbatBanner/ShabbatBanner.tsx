import styles from "./ShabbatBanner.module.css";

// Informational only — shown when /shabbatScreen reports it's not currently
// Shabbat/chag, since the elevator may be in normal (button-operated)
// service and this display may not reflect what's actually happening.
export function ShabbatBanner({ isShabbat }: { isShabbat: boolean | null }) {
  if (isShabbat !== false) return null;

  return (
    <div className={styles.banner}>
      כרגע ככל הנראה לא שבת/חג — ייתכן שהמעלית פועלת במצב רגיל ואינה תואמת לתצוגה זו
    </div>
  );
}
