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

function dateForDatePicker(d) {
  return new Date(d).toISOString().split("T")[0];
}

function getAge(d) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  const diffTime = Math.abs(date.getTime() - now.getTime());
  const age = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365.25));
  if (!age || isNaN(age)) return "?";
  return age;
}

function isIsoDate(str) {
  if (!Date.parse(str)) {
    return false;
  }
  const d = new Date(str);

  return d.toISOString() === str;
}

function calculateAge(birthDate, otherDate) {
  birthDate = new Date(birthDate);
  otherDate = new Date(otherDate);

  let years = otherDate.getFullYear() - birthDate.getFullYear();

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

const getZonedDate = (date, timeZone = "Europe/Paris") => {
  const zonedDate = toZonedTime(date, timeZone);
  return zonedDate;
};

const getDateTimeByTimeZoneOffset = (timeZoneOffset: number | null = null) => {
  let now = Date.now();
  if (timeZoneOffset) {
    const userTimezoneOffsetInMilliseconds = timeZoneOffset * 60 * 1000; // User's offset from UTC
    // Adjust server's time for user's timezone
    now = new Date().getTime() - userTimezoneOffsetInMilliseconds;
  }
  return new Date(now);
};

const isNowBetweenDates = (from, to) => {
  if (!from && !to) return true;
  const now = new Date().toISOString();
  return (from <= now && now <= to) || (!from && now <= to) || (from <= now && !to);
};

const formatDateTimeZone = (date) => {
  //set timezone to UTC
  const d = new Date(date);
  d.toISOString();
  return d;
};

const setToEndOfDay = (date: Date): Date => {
  date.setUTCHours(21, 0, 0, 0); // Set to 21:00:00.000 UTC
  return date;
};

function checkTime(time1, time2) {
  const time1Split = time1.split(":");
  const time2Split = time2.split(":");

  // Check if the hours are equal
  if (time1Split[0] === time2Split[0]) {
    // If the hours are equal, check if the minutes in time2 are greater than time1
    if (time2Split[1] >= time1Split[1]) {
      return true;
    } else {
      return false;
    }
  } else {
    // If the hours are not equal, check if the hours in time2 are greater than time1
    if (time2Split[0] > time1Split[0]) {
      return true;
    } else {
      return false;
    }
  }
}

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
  dateForDatePicker,
  getAge,
  getDateTimeByTimeZoneOffset,
  getZonedDate,
  formatLongDateUTCWithoutTime,
  isIsoDate,
  calculateAge,
  formatDateForPostGre,
  isNowBetweenDates,
  formatDateTimeZone,
  checkTime,
  setToEndOfDay,
};
