import dayjs from "dayjs";
import fr from "dayjs/locale/fr";
import relativeTime from "dayjs/plugin/relativeTime";
import advancedFormat from "dayjs/plugin/advancedFormat";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(relativeTime).extend(advancedFormat).extend(utc).extend(timezone);
dayjs.locale(fr);

// ! ISO format exemple : "2011-10-05T14:48:00.000Z"

// Note to get UTC date wherever on the planet
// 1. Save the date in UTC format with 00:00:00 time, like: 2023-10-09T00:00:00.000Z
// 2. Get the date and add the getTimezoneOffset() minutes to prevent timezones with negative offset to get the previous date

// Set a date to the fix UTC date/time: yyyy-MM-ddT00:00:00.000Z (GMT+0)
dayjs.prototype.toUtc = function () {
  return this.utc().year(this.$d.getFullYear()).month(this.$d.getMonth()).date(this.$d.getDate()).hour(0).minute(0).second(0).millisecond(0);
};

// Get the local date of the UTC date/time: yyyy-MM-ddT04:00:00.000Z (GMT-4)
dayjs.prototype.toUtcLocally = function () {
  return this.year(this.$d.getFullYear()).month(this.$d.getMonth()).date(this.$d.getDate()).shiftTimeToUtc().hour(0).second(0).millisecond(0);
};

dayjs.prototype.shiftTimeToUtc = function () {
  // Add the timezone offset to the date not the current date because getTimezoneOffset
  // can vary depending on the date (daylight saving time)
  this.$d.setMinutes(this.$d.getMinutes() + new Date(this.$d).getTimezoneOffset());
  return this;
};

export default dayjs;
