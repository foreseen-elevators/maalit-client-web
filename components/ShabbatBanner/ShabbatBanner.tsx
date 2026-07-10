import styles from "./ShabbatBanner.module.css";

// Same banner slot at the top of the elevator display, showing one of two
// informational messages depending on /shabbatScreen - never used to gate
// or block the display itself.
export function ShabbatBanner({ isShabbat }: { isShabbat: boolean | null }) {
  if (isShabbat === null) return null;

  if (isShabbat) {
    return (
      <div className={styles.banner} data-variant="shabbat">
        אסור לגעת במסך במהלך השבת
      </div>
    );
  }

  return (
    <div className={styles.banner} data-variant="info">
      כרגע ככל הנראה לא שבת/חג - ייתכן שהמעלית פועלת במצב רגיל ואינה תואמת לתצוגה זו
    </div>
  );
}
