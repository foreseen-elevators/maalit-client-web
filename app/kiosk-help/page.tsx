"use client";

import Link from "next/link";
import styles from "./page.module.css";

function enterFullscreen() {
  const el = document.documentElement;
  if (el.requestFullscreen) {
    el.requestFullscreen().catch(() => {});
  }
}

export default function KioskHelpPage() {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>הגדרת מסך קבוע (מצב קיוסק)</h1>

      <p className={styles.warning}>
        חשוב לדעת: אתר אינטרנט (גם כשמותקן כאפליקציה) לא יכול למנוע לגמרי
        מהמכשיר לעבור לאפליקציה אחרת, להציג התראות, או לצאת מהדף. האפליקציה
        הזו עושה את מה שכן אפשרי — השארת המסך דלוק ומסך מלא — אבל הנעילה
        האמיתית שמונעת יציאה מהדף חייבת להיעשות פעם אחת בהגדרות המכשיר עצמו,
        כמתואר למטה.
      </p>

      <button className={styles.fullscreenButton} onClick={enterFullscreen}>
        מעבר למסך מלא
      </button>

      <section className={styles.section}>
        <h2>אנדרואיד — הצמדת מסך (Screen Pinning)</h2>
        <ol>
          <li>הגדרות ← אבטחה (או מסך נעילה) ← הצמדת אפליקציה — הפעילו את האפשרות.</li>
          <li>פתחו את הדפדפן עם דף זה, היכנסו לתצוגת המעליות.</li>
          <li>פתחו את מסך האפליקציות האחרונות (הכפתור המרובע / החלקה מלמטה ועצירה).</li>
          <li>לחצו על סמל הדפדפן שבראש הכרטיס ובחרו &quot;הצמד&quot;.</li>
          <li>
            לביטול ההצמדה בהמשך: החזיקו יחד את כפתורי החזרה וההיסטוריה (או
            עקבו אחר ההנחיה שמופיעה במסך).
          </li>
        </ol>
      </section>

      <section className={styles.section}>
        <h2>iPhone / iPad — גישה מודרכת (Guided Access)</h2>
        <ol>
          <li>הגדרות ← נגישות ← גישה מודרכת — הפעילו, והגדירו קוד סיסמה.</li>
          <li>פתחו את דף תצוגת המעליות ב-Safari.</li>
          <li>לחצו שלוש פעמים מהר על כפתור הצד (או כפתור הבית) כדי להתחיל גישה מודרכת.</li>
          <li>
            לסיום מאוחר יותר: לחצו שלוש פעמים שוב על אותו כפתור והזינו את קוד
            הסיסמה שהוגדר.
          </li>
        </ol>
        <p className={styles.note}>
          חשוב לשמור את קוד הסיסמה במקום נגיש לצוות הבניין — שכחתו נועל את
          המכשיר על מסך זה בלבד.
        </p>
      </section>

      <section className={styles.section}>
        <h2>מה קורה אוטומטית לעומת מה שדורש הגדרה ידנית</h2>
        <div className={styles.compare}>
          <div>
            <h3>האפליקציה עושה לבד</h3>
            <ul>
              <li>שמירה על המסך דלוק (Wake Lock)</li>
              <li>מעבר למסך מלא (בלחיצה)</li>
              <li>עדכון חי של מצב המעליות</li>
            </ul>
          </div>
          <div>
            <h3>דורש הגדרה ידנית במכשיר</h3>
            <ul>
              <li>הצמדת מסך / גישה מודרכת</li>
              <li>מניעת יציאה מהדף לאפליקציות אחרות</li>
            </ul>
          </div>
        </div>
      </section>

      <Link href="/" className={styles.backLink}>
        חזרה לבחירת כתובת
      </Link>
    </main>
  );
}
