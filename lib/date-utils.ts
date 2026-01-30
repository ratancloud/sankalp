import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { WeekDay } from "@/generated/prisma/enums";

export const INDIA_TIMEZONE = "Asia/Kolkata";

export const JS_DAY_TO_PRISMA: Record<number, WeekDay> = {
  0: WeekDay.Sunday,
  1: WeekDay.Monday,
  2: WeekDay.Tuesday,
  3: WeekDay.Wednesday,
  4: WeekDay.Thursday,
  5: WeekDay.Friday,
  6: WeekDay.Saturday,
};

export function toIndiaBucket(date: Date | string): Date {
  const d = new Date(date);
  const zoned = toZonedTime(d, INDIA_TIMEZONE);
  const s = format(zoned, "yyyy-MM-dd");
  return new Date(`${s}T00:00:00.000Z`);
}

export function getIndiaWeekdayEnum(date: Date | string): WeekDay {
  const d = new Date(date);
  const zoned = toZonedTime(d, INDIA_TIMEZONE);
  return JS_DAY_TO_PRISMA[zoned.getDay()];
}