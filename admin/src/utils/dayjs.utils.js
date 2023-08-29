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
// 2. Get the date and add the absolute(timezone offset) to the minutes to prevent timezones with negative offset to get the previous date

dayjs.prototype.isoToUtc = function (iso) {
  if (!iso || typeof iso?.getMonth === "function") return dayjs(iso).toUtc(); // prevent if empty or not iso
  const date = new Date(iso.split("T").shift());
  return dayjs(date);
};

dayjs.prototype.isoToUtcWithTime = function (iso) {
  if (!iso || typeof iso?.getMonth === "function") return dayjs(iso).toUtcWithTime(); // prevent if empty or not iso
  return dayjs(new Date(iso.split("Z").shift())).shiftTime();
};

dayjs.prototype.toUtc = function () {
  this.utc().year(this.$d.getFullYear()).month(this.$d.getMonth()).date(this.$d.getDate()).hour(0).minute(0).second(0).millisecond(0);
  return this;
};

dayjs.prototype.toUtcWithTime = function (hours, minutes, seconds) {
  this.utc()
    .year(this.$d.getFullYear())
    .month(this.$d.getMonth())
    .date(this.$d.getDate())
    .hour(hours || 0)
    .minute(minutes || 0)
    .second(seconds || 0)
    .millisecond(0);
  return this.shiftTime();
};

dayjs.prototype.shiftTime = function () {
  this.$d.setMinutes(this.$d.getMinutes() + Math.abs(new Date().getTimezoneOffset()));
  return this;
};

export default dayjs;
