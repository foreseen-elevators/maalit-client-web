"use client";

import { useMemo, useState } from "react";
import { useAddressList } from "../../hooks/useAddressList";
import type { AddressEntry } from "../../lib/api/addressList";
import styles from "./AddressSearch.module.css";

interface AddressSearchProps {
  onSelect: (address: AddressEntry) => void;
}

export function AddressSearch({ onSelect }: AddressSearchProps) {
  const { addresses, loading, error } = useAddressList();
  const [query, setQuery] = useState("");
  const [highlighted, setHighlighted] = useState(0);

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return addresses;
    return addresses.filter((a) => a.name.includes(q));
  }, [addresses, query]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const match = filtered[highlighted];
      if (match) onSelect(match);
    }
  }

  return (
    <div className={styles.container}>
      <input
        className={styles.input}
        type="text"
        dir="rtl"
        placeholder="חפשו כתובת..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setHighlighted(0);
        }}
        onKeyDown={handleKeyDown}
        aria-label="חיפוש כתובת"
        autoFocus
      />

      {loading && <p className={styles.status}>טוען כתובות...</p>}
      {error && <p className={styles.status}>{error}</p>}

      {!loading && !error && (
        <ul className={styles.list} role="listbox">
          {filtered.length === 0 && (
            <li className={styles.empty}>לא נמצאו כתובות תואמות</li>
          )}
          {filtered.map((address, index) => (
            <li key={address.id}>
              <button
                type="button"
                className={styles.option}
                data-highlighted={index === highlighted}
                onClick={() => onSelect(address)}
                onMouseEnter={() => setHighlighted(index)}
              >
                {address.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
