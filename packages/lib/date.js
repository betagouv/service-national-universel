import { isSameYear, subYears, format, setYear, setMonth, setDate, isWithinInterval, getYear } from "date-fns";
import { formatInTimeZone } from 'date-fns-tz';

const MONTHS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

const formatDay = (date) => {
  if (!date) return "-";
  // return new Date(date).toISOString().split("T")[0];
  return format(new Date(date), "yyyy-MM-dd");
};

const isLastYear = (date) => {
  const dateObj = new Date(date);
  const lastYear = subYears(new Date(), 1);
  return isSameYear(dateObj, lastYear);
};


const isLastSchoolYear = (date) => {
  const dateObj = new Date(date);
  const currentYear = getYear(new Date());
  const currentYearStartDate = new Date(currentYear, 8, 1); // 1er septembre de l'année en cours
  const lastYearStartDate = subYears(currentYearStartDate, 1)

return isWithinInterval(dateObj, {
    start: currentYearStartDate,
    end: lastYearStartDate,
  });};

// const isLastSchoolYear = (date) => {
//   const currentYear = new Date().getFullYear();

//   // Début de l'année scolaire précédente : 1er septembre de l'année dernière
//   const startOfLastSchoolYear = new Date(setDate(setMonth(setYear(new Date(), currentYear - 1), 8), 1));

//   // Fin de l'année scolaire précédente : 31 août de cette année
//   const endOfLastSchoolYear = new Date(setDate(setMonth(setYear(new Date(), currentYear), 8), 0));

//   return isWithinInterval(date, {
//     start: startOfLastSchoolYear,
//     end: endOfLastSchoolYear,
//   });
// };

// const formatDateFR = (d) => {
//   if (!d) return "-";
//   const date = new Date(d);
//   return date.toLocaleDateString("fr-FR");
// };
const formatDateFR = (date) => {
  if (!date) return "-";
  const timeZone = 'Europe/Paris';
  return formatInTimeZone(date, timeZone, 'dd/MM/yyyy');
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

export {
  MONTHS,
  formatDay,
  isLastYear,
  isLastSchoolYear,
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
