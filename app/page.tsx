"use client";

import { useRouter } from "next/navigation";
import { AddressSearch } from "../components/AddressSearch/AddressSearch";
import type { AddressEntry } from "../lib/api/addressList";
import styles from "./page.module.css";

export default function HomePage() {
  const router = useRouter();

  function handleSelect(address: AddressEntry) {
    router.push(`/elevators/${address.id}`);
  }

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>מעלית שבת</h1>
      <p className={styles.subtitle}>בחרו כתובת כדי לראות את מצב המעליות</p>
      <AddressSearch onSelect={handleSelect} />
    </main>
  );
}
