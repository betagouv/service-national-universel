import dayjs from "dayjs";
import fr from "dayjs/locale/fr";
import relativeTime from "dayjs/plugin/relativeTime";
import advancedFormat from "dayjs/plugin/advancedFormat";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(relativeTime).extend(advancedFormat).extend(utc).extend(timezone);
dayjs.locale(fr);

dayjs.prototype.isoToUtc = function (iso) {
  if (!iso || typeof iso?.getMonth === "function") return dayjs(iso).toUtc(); // prevent if empty or not iso
  const date = new Date(iso.split("T").shift());
  return dayjs(date);
};

dayjs.prototype.isoToUtcWithTime = function (iso) {
  if (!iso || typeof iso?.getMonth === "function") return dayjs(iso).toUtcWithTime(); // prevent if empty or not iso
  const date = new Date(iso.split("Z").shift());
  return dayjs(date);
};

dayjs.prototype.toUtc = function () {
  this.$d = new Date(Date.UTC(this.$d.getFullYear(), this.$d.getMonth(), this.$d.getDate(), 0, 0, 0));
  return this;
};

dayjs.prototype.toUtcWithTime = function (hours, minutes, seconds) {
  this.$d = new Date(
    Date.UTC(this.$d.getFullYear(), this.$d.getMonth(), this.$d.getDate(), hours || this.$d.getHours(), minutes || this.$d.getMinutes(), seconds || this.$d.getSeconds()),
  );
  return this;
};

export default dayjs;
