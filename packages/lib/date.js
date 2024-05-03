import { toZonedTime } from "date-fns-tz";

const MONTHS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

const formatDay = (date) => {
  if (!date) return "-";
  return new Date(date).toISOString().split("T")[0];
};

const formatDateFR = (d) => {
  if (!d) return "-";
  const date = new Date(d);
  return date.toLocaleDateString("fr-FR");
};
const formatToActualTime = (d) => {
  if (!d) return "-";
  const date = new Date(d);
  let localTime = date.toLocaleTimeString(navigator.language, {
    hour: "2-digit",
    minute: "2-digit",
  });
  localTime = localTime.replace(/:/, "h ");
  localTime = localTime.replace(/:/, "min ");
  return localTime;
};
const formatLongDateFR = (d) => {
  if (!d) return "-";
  const date = new Date(d);
  return date.toLocaleDateString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};
const formatDateFRTimezoneUTC = (d) => {
  if (!d) return "-";
  const date = new Date(d);
  return date.toLocaleDateString("fr-FR", {
    timeZone: "UTC",
  });
};
const formatLongDateUTC = (d) => {
  if (!d) return "-";
  const date = new Date(d);
  return date.toLocaleDateString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
};
const formatLongDateUTCWithoutTime = (d) => {
  if (!d) return "-";
  const date = new Date(d);
  return date.toLocaleDateString("fr-FR", {
    timeZone: "UTC",
  });
};

const formatStringLongDate = (date) => {
  if (!date) return "-";
  const d = new Date(date);
  return d.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatStringDate = (date) => {
  if (!date) return "-";
  const d = new Date(date);
  return d.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatStringDateTimezoneUTC = (date) => {
  if (!date) return "-";
  const d = new Date(date);
  return d.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
};

const formatStringDateWithDayTimezoneUTC = (date) => {
  if (!date) return "-";
  const d = new Date(date);
  return d.toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
};

function dateForDatePicker(d) {
  return new Date(d).toISOString().split("T")[0];
}

function getAge(d) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  const diffTime = Math.abs(date - now);
  const age = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365.25));
  if (!age || isNaN(age)) return "?";
  return age;
}

function isIsoDate(str) {
  if (!Date.parse(str)) {
    return false;
  }
  var d = new Date(str);

  return d.toISOString() === str;
}

function calculateAge(birthDate, otherDate) {
  birthDate = new Date(birthDate);
  otherDate = new Date(otherDate);

  var years = otherDate.getFullYear() - birthDate.getFullYear();

  if (otherDate.getMonth() < birthDate.getMonth() || (otherDate.getMonth() == birthDate.getMonth() && otherDate.getDate() < birthDate.getDate())) {
    years--;
  }

  return years;
}

const formatDateForPostGre = (date) => {
  if (!date) return "-";
  const d = new Date(date);
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const getZonedDate = (date, timeZone = "Europe/Paris") => {
  const zonedDate = toZonedTime(new Date(date), timeZone);
  return zonedDate;
};

export {
  MONTHS,
  formatDay,
  formatDateFR,
  formatToActualTime,
  formatLongDateFR,
  formatDateFRTimezoneUTC,
  formatLongDateUTC,
  formatStringLongDate,
  formatStringDate,
  formatStringDateTimezoneUTC,
  formatStringDateWithDayTimezoneUTC,
  dateForDatePicker,
  getAge,
  formatLongDateUTCWithoutTime,
  isIsoDate,
  calculateAge,
  formatDateForPostGre,
};
