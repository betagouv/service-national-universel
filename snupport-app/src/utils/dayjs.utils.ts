import dayjs from "dayjs";
import fr from "dayjs/locale/fr";
import relativeTime from "dayjs/plugin/relativeTime";
import advancedFormat from "dayjs/plugin/advancedFormat";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(relativeTime);
dayjs.extend(advancedFormat);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale(fr);

type EnhancedDayjs = ReturnType<typeof dayjs> & {
  toUtc(): EnhancedDayjs;
  toUtcLocally(): EnhancedDayjs;
  shiftTimeToUtc(): EnhancedDayjs;
};

// Set a date to the fix UTC date/time: yyyy-MM-ddT00:00:00.000Z (GMT+0)
dayjs.prototype.toUtc = function () {
  return this.utc().year(this.$d.getFullYear()).month(this.$d.getMonth()).date(this.$d.getDate()).hour(0).minute(0).second(0).millisecond(0);
};

// Get the local date of the UTC date/time: yyyy-MM-ddT04:00:00.000Z (GMT-4)
dayjs.prototype.toUtcLocally = function () {
  return dayjs.utc(this.format("YYYY-MM-DD"), "YYYY-MM-DD");
};

dayjs.prototype.shiftTimeToUtc = function () {
  // Add the timezone offset to the date not the current date because getTimezoneOffset
  // can vary depending on the date (daylight saving time)
  this.$d.setMinutes(this.$d.getMinutes() + new Date(this.$d).getTimezoneOffset());
  return this;
};

const createDate = (date?: dayjs.ConfigType): EnhancedDayjs => {
  return dayjs(date) as EnhancedDayjs;
};

export const parseDate = (date?: dayjs.ConfigType): EnhancedDayjs => createDate(date);

export const createUtcDate = (date?: dayjs.ConfigType): EnhancedDayjs => createDate(date).toUtc();

export const createLocalUtcDate = (date?: dayjs.ConfigType): EnhancedDayjs => createDate(date).toUtcLocally();

export const toUtcLocally = (date?: dayjs.ConfigType): Date => createDate(date).toUtcLocally().toDate();

export const toUtc = (date?: dayjs.ConfigType): Date => createDate(date).toUtc().toDate();

export const formatDate = (date: dayjs.ConfigType, format = "YYYY-MM-DD"): string => createDate(date).format(format);

export const isValidDate = (date: dayjs.ConfigType): boolean => createDate(date).isValid();

export const now = (): EnhancedDayjs => createDate();

export const today = (): Date => createDate().toUtcLocally().toDate();

export const addDays = (date: dayjs.ConfigType, days: number): EnhancedDayjs => createDate(date).add(days, "day") as EnhancedDayjs;

export const subtractDays = (date: dayjs.ConfigType, days: number): EnhancedDayjs => createDate(date).subtract(days, "day") as EnhancedDayjs;

export const isBefore = (date1: dayjs.ConfigType, date2: dayjs.ConfigType): boolean => createDate(date1).isBefore(createDate(date2));

export const isAfter = (date1: dayjs.ConfigType, date2: dayjs.ConfigType): boolean => createDate(date1).isAfter(createDate(date2));

export const isSame = (date1: dayjs.ConfigType, date2: dayjs.ConfigType, unit?: dayjs.OpUnitType): boolean => createDate(date1).isSame(createDate(date2), unit);

export const diffInDays = (date1: dayjs.ConfigType, date2: dayjs.ConfigType): number => createDate(date1).diff(createDate(date2), "day");

// Export the type for use in other files
export type { EnhancedDayjs };
