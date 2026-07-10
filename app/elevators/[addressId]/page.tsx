"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useClientId } from "../../../hooks/useClientId";
import { useAllConfigScreen } from "../../../hooks/useAllConfigScreen";
import { useAddressList } from "../../../hooks/useAddressList";
import { useShabbatStatus } from "../../../hooks/useShabbatStatus";
import { useWakeLock } from "../../../hooks/useWakeLock";
import { elevatorCountFrom } from "../../../lib/api/allConfigScreen";
import { setLastAddressId } from "../../../lib/lastAddress";
import { ElevatorGrid } from "../../../components/ElevatorGrid/ElevatorGrid";
import { ShabbatBanner } from "../../../components/ShabbatBanner/ShabbatBanner";
import { ShabbatInfo } from "../../../components/ShabbatInfo/ShabbatInfo";
import { WakeLockIndicator } from "../../../components/WakeLockIndicator/WakeLockIndicator";
import { Disclaimer } from "../../../components/Disclaimer/Disclaimer";
import styles from "./page.module.css";

export default function ElevatorDisplayPage() {
  const params = useParams<{ addressId: string }>();
  const addressId = params.addressId;
  const clientId = useClientId();

  const { config, loading, error } = useAllConfigScreen(clientId, addressId);
  const { addresses } = useAddressList();
  const { isShabbat } = useShabbatStatus(clientId, addressId);
  const { status: wakeLockStatus } = useWakeLock();

  const addressName = addresses.find(
    (a) => String(a.id) === addressId,
  )?.name;

  useEffect(() => {
    if (!loading && !error && config) {
      setLastAddressId(addressId);
    }
  }, [loading, error, config, addressId]);

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
        <Link href="/?change=1" className={styles.backLink}>
          חזרה לבחירת כתובת
        </Link>
      </main>
    );
  }

  const elevatorCount = elevatorCountFrom(config);

  return (
    <main className={styles.main}>
      <ShabbatBanner isShabbat={isShabbat} />
      <ShabbatInfo />
      <ElevatorGrid
        clientId={clientId}
        addressId={addressId}
        elevatorCount={elevatorCount}
      />
      <Disclaimer />
      <div className={styles.footer}>
        <div className={styles.footerLinks}>
          {addressName && (
            <span className={styles.currentAddress}>{addressName}</span>
          )}
          <Link href="/?change=1" className={styles.backLink}>
            בחירת כתובת אחרת
          </Link>
          <Link href="/kiosk-help" className={styles.backLink}>
            הגדרת מסך קבוע
          </Link>
        </div>
        <WakeLockIndicator status={wakeLockStatus} />
      </div>
    </main>
  );
}
