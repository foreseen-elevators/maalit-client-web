"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AddressSearch } from "../components/AddressSearch/AddressSearch";
import { useLastAddressId } from "../hooks/useLastAddressId";
import type { AddressEntry } from "../lib/api/addressList";
import styles from "./page.module.css";

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const lastAddressId = useLastAddressId();
  const forceChange = searchParams.get("change") === "1";
  const shouldRedirect = !forceChange && !!lastAddressId;

  useEffect(() => {
    if (shouldRedirect) {
      router.replace(`/elevators/${lastAddressId}`);
    }
  }, [shouldRedirect, lastAddressId, router]);

  function handleSelect(address: AddressEntry) {
    router.push(`/elevators/${address.id}`);
  }

  if (shouldRedirect) {
    return (
      <main className={styles.main}>
        <p className={styles.subtitle}>טוען את הכתובת האחרונה...</p>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>מעלית שבת</h1>
      <p className={styles.subtitle}>בחרו כתובת כדי לראות את מצב המעליות</p>
      <AddressSearch onSelect={handleSelect} />
    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}
