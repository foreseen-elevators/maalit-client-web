import Image from "next/image";
import logo from "../../public/icon-mono.png";
import { useShabbatInfo } from "../../hooks/useShabbatInfo";
import styles from "./ShabbatInfo.module.css";

// Hidden on phones by CSS (not enough room to show this legibly) - see
// the module's max-width media query. Rendered unconditionally here since
// the hook's 1-second clock tick would be wasted work behind a JS-side check.
export function ShabbatInfo() {
  const { time, hebrewDate, parasha, cities } = useShabbatInfo();

  return (
    <section className={styles.panel} aria-label="מידע לשבת">
      <div className={styles.summary}>
        <span className={styles.clock}>{time}</span>
        <span className={styles.hebrewDate}>{hebrewDate}</span>
        {parasha && <span className={styles.parasha}>{parasha}</span>}
      </div>
      <div className={styles.logo}>
        <Image
          src={logo}
          alt="מעלית שבת"
          fill
          sizes="64px"
          style={{ objectFit: "contain" }}
        />
      </div>
      <table className={styles.cityTable}>
        <thead>
          <tr>
            <th scope="col"></th>
            <th scope="col">כניסת שבת</th>
            <th scope="col">יציאת שבת</th>
          </tr>
        </thead>
        <tbody>
          {cities.map((city) => (
            <tr key={city.name}>
              <th scope="row">{city.name}</th>
              <td>{city.candleLighting ?? "--"}</td>
              <td>{city.havdalah ?? "--"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
