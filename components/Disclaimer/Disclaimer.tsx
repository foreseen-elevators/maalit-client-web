import styles from "./Disclaimer.module.css";

// Always visible on the elevator display - the floor number is a computed
// estimate, not a direct reading from the elevator controller, so this
// needs to be up front rather than buried in a help page.
export function Disclaimer() {
  return (
    <p className={styles.disclaimer}>
      ⚠️ המספר המוצג אינו מבוסס על חיבור ישיר לבקר המעלית, אלא על חישוב משוער
      של הקומה. ייתכנו טעויות - מומלץ להקדים ולצאת כמה שניות לפני הגעתה
    </p>
  );
}
