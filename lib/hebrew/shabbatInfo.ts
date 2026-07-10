import {
  HebrewCalendar,
  Location,
  Zmanim,
  CandleLightingEvent,
  HavdalahEvent,
  ParshaEvent,
} from "@hebcal/core";

export interface CityShabbatTimes {
  name: string;
  candleLighting: string | null;
  havdalah: string | null;
}

interface CityDef {
  name: string;
  hebcalName: string;
}

// hebcalName must match one of hebcal's ~60 built-in "classic" cities so that
// Location.lookup also picks up its candle-lighting-minutes override
// (Jerusalem 40, Haifa 30, others the 18-minute default).
const CITIES: CityDef[] = [
  { name: "תל אביב", hebcalName: "Tel Aviv" },
  { name: "ירושלים", hebcalName: "Jerusalem" },
  { name: "חיפה", hebcalName: "Haifa" },
  { name: "באר שבע", hebcalName: "Beer Sheva" },
];

const DAY_MS = 24 * 60 * 60 * 1000;

// Only used to decide *which* Shabbat is current/upcoming - a few minutes'
// difference between cities' Havdalah times never changes which Saturday
// that resolves to, so one reference location is enough.
const REFERENCE_LOCATION = Location.lookup("Jerusalem")!;

function resolveShabbatWeek(now: Date): { friday: Date; saturday: Date } {
  const events = HebrewCalendar.calendar({
    start: new Date(now.getTime() - DAY_MS),
    end: new Date(now.getTime() + 9 * DAY_MS),
    candlelighting: true,
    location: REFERENCE_LOCATION,
    il: true,
    noHolidays: true,
  });

  const upcomingHavdalah = events
    .filter((ev): ev is HavdalahEvent => ev instanceof HavdalahEvent)
    .sort((a, b) => a.eventTime.getTime() - b.eventTime.getTime())
    .find((ev) => ev.eventTime.getTime() > now.getTime());

  // A 9-day lookahead always contains the next Havdalah, since Shabbat
  // recurs every 7 days.
  const saturday = upcomingHavdalah!.getDate().greg();
  const friday = new Date(saturday);
  friday.setDate(friday.getDate() - 1);
  return { friday, saturday };
}

export function getCityShabbatTimes(now: Date): CityShabbatTimes[] {
  const { friday, saturday } = resolveShabbatWeek(now);

  return CITIES.map((city) => {
    const location = Location.lookup(city.hebcalName)!;
    const events = HebrewCalendar.calendar({
      start: friday,
      end: saturday,
      candlelighting: true,
      location,
      il: true,
      noHolidays: true,
    });

    const candleLighting = events.find(
      (ev): ev is CandleLightingEvent => ev instanceof CandleLightingEvent,
    );
    const havdalah = events.find(
      (ev): ev is HavdalahEvent => ev instanceof HavdalahEvent,
    );

    return {
      name: city.name,
      candleLighting: candleLighting?.eventTimeStr ?? null,
      havdalah: havdalah?.eventTimeStr ?? null,
    };
  });
}

// Null when this Shabbat's reading is displaced by a holiday (e.g. Shabbat
// Chol HaMoed) - rare, and not worth a fallback for an informational display.
export function getParashaName(now: Date): string | null {
  const { friday, saturday } = resolveShabbatWeek(now);
  const events = HebrewCalendar.calendar({
    start: friday,
    end: saturday,
    sedrot: true,
    il: true,
    noHolidays: true,
    locale: "he-x-NoNikud",
  });
  const parsha = events.find((ev): ev is ParshaEvent => ev instanceof ParshaEvent);
  return parsha ? parsha.render("he-x-NoNikud") : null;
}

// The Hebrew date changes at sunset, not midnight - Jerusalem's sunset is
// used as the reference for the whole app regardless of which city's
// elevator is being viewed.
export function getHebrewDateString(now: Date): string {
  const hd = Zmanim.makeSunsetAwareHDate(REFERENCE_LOCATION, now, false);
  return hd.renderGematriya(true);
}
