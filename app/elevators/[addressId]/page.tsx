"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useClientId } from "../../../hooks/useClientId";
import { useAllConfigScreen } from "../../../hooks/useAllConfigScreen";
import { useShabbatStatus } from "../../../hooks/useShabbatStatus";
import { useWakeLock } from "../../../hooks/useWakeLock";
import { elevatorCountFrom } from "../../../lib/api/allConfigScreen";
import { ElevatorGrid } from "../../../components/ElevatorGrid/ElevatorGrid";
import { ShabbatBanner } from "../../../components/ShabbatBanner/ShabbatBanner";
import { WakeLockIndicator } from "../../../components/WakeLockIndicator/WakeLockIndicator";
import styles from "./page.module.css";

export default function ElevatorDisplayPage() {
  const params = useParams<{ addressId: string }>();
  const addressId = params.addressId;
  const clientId = useClientId();

  const { config, loading, error } = useAllConfigScreen(clientId, addressId);
  const { isShabbat } = useShabbatStatus(clientId, addressId);
  const { status: wakeLockStatus } = useWakeLock();

  if (loading) {
    return (
      <main className={styles.main}>
        <p className={styles.status}>טוען...</p>
      </main>
    );
  }

  if (error || !config) {
    return (
      <main className={styles.main}>
        <p className={styles.status}>{error ?? "כתובת לא נמצאה"}</p>
        <Link href="/" className={styles.backLink}>
          חזרה לבחירת כתובת
        </Link>
      </main>
    );
  }

  const elevatorCount = elevatorCountFrom(config);

  return (
    <main className={styles.main}>
      <ShabbatBanner isShabbat={isShabbat} />
      <ElevatorGrid
        clientId={clientId}
        addressId={addressId}
        elevatorCount={elevatorCount}
      />
      <div className={styles.footer}>
        <Link href="/" className={styles.backLink}>
          בחירת כתובת אחרת
        </Link>
        <WakeLockIndicator status={wakeLockStatus} />
      </div>
    </main>
  );
}
