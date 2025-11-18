import type { RestaurantSettings } from "@/types/restaurant-settings";

export function dayMonthYear(date: Date) {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  const day = String(d.getUTCDate()).padStart(2, "0");
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const y = d.getUTCFullYear();
  return `${y}-${m}-${day}`;
}

export function weekday(date: Date) {
  return new Date(date).getUTCDay();
}

export function timeInRange(time: string, from?: string, to?: string) {
  if (!from && !to) return true;
  return (from ? time >= from : true) && (to ? time < to : true);
}

export function isPastDay(date: Date) {
  const now = new Date();
  const today = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );
  const inputDay = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
  );
  return inputDay < today;
}

export function isClosedAt(
  settings: unknown,
  date: Date,
  time: string,
): boolean {
  const s = (settings ?? {}) as RestaurantSettings;

  const dmy = dayMonthYear(date);
  const closedDates = s.closedDates ?? [];
  const closedDate = closedDates.find(
    cd => cd.date === dmy && timeInRange(time, cd.from, cd.to),
  );
  if (closedDate) return true;

  const wd = weekday(date);
  const weekly = s.closedWeekly ?? [];
  const closedWeekly = weekly.find(
    w => w.weekday === wd && timeInRange(time, w.from, w.to),
  );
  if (closedWeekly) return true;

  return false;
}
