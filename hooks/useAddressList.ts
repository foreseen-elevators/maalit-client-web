"use client";

import { useEffect, useState } from "react";
import { fetchAddressList, type AddressEntry } from "../lib/api/addressList";

interface AddressListState {
  addresses: AddressEntry[];
  loading: boolean;
  error: string | null;
}

export function useAddressList(): AddressListState {
  const [state, setState] = useState<AddressListState>({
    addresses: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    const controller = new AbortController();

    fetchAddressList(controller.signal)
      .then((addresses) => {
        setState({ addresses, loading: false, error: null });
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setState({
          addresses: [],
          loading: false,
          error: "לא הצלחנו לטעון את רשימת הכתובות",
        });
      });

    return () => controller.abort();
  }, []);

  return state;
}
