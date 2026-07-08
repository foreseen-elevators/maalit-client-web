"use client";

import { useEffect, useState } from "react";
import {
  fetchAllConfigScreen,
  type AllConfigScreenResponse,
} from "../lib/api/allConfigScreen";

interface ConfigState {
  key: string;
  config: AllConfigScreenResponse | null;
  error: string | null;
}

const EMPTY: ConfigState = { key: "", config: null, error: null };

export function useAllConfigScreen(
  clientId: string,
  addressId: string,
): { config: AllConfigScreenResponse | null; loading: boolean; error: string | null } {
  const key = `${clientId}:${addressId}`;
  const [state, setState] = useState<ConfigState>(EMPTY);

  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();
    const requestKey = `${clientId}:${addressId}`;

    fetchAllConfigScreen(clientId, addressId, controller.signal)
      .then((config) => {
        if (!ignore) setState({ key: requestKey, config, error: null });
      })
      .catch((err) => {
        if (ignore) return;
        if (err instanceof DOMException && err.name === "AbortError") return;
        setState({
          key: requestKey,
          config: null,
          error: "לא נמצא מידע עבור כתובת זו",
        });
      });

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [clientId, addressId]);

  // Derived rather than reset via a synchronous setState at the top of the
  // effect — while state.key doesn't match the current request key yet,
  // we're still loading for these props.
  const loading = state.key !== key;

  return {
    config: loading ? null : state.config,
    loading,
    error: loading ? null : state.error,
  };
}
