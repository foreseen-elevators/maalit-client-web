"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getCityShabbatTimes,
  getHebrewDateString,
  getParashaName,
  type CityShabbatTimes,
} from "../lib/hebrew/shabbatInfo";

export interface ShabbatInfoState {
  time: string;
  hebrewDate: string;
  parasha: string | null;
  cities: CityShabbatTimes[];
}

const MINUTE_MS = 60 * 1000;

const timeFormatter = new Intl.DateTimeFormat("he-IL", {
  timeZone: "Asia/Jerusalem",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

// Candle-lighting/Havdalah/parasha/Hebrew-date only ever change on a
// day boundary, so they're recomputed once a minute rather than every tick.
export function useShabbatInfo(): ShabbatInfoState {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const intervalId = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(intervalId);
  }, []);

  const minuteKey = Math.floor(now.getTime() / MINUTE_MS);

  const { hebrewDate, parasha, cities } = useMemo(() => {
    const reference = new Date(minuteKey * MINUTE_MS);
    return {
      hebrewDate: getHebrewDateString(reference),
      parasha: getParashaName(reference),
      cities: getCityShabbatTimes(reference),
    };
  }, [minuteKey]);

  return {
    time: timeFormatter.format(now),
    hebrewDate,
    parasha,
    cities,
  };
}
