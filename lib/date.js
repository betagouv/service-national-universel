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
  const localTime = date.toLocaleTimeString(navigator.language, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  localTime.replace(/:/, "h ");
  localTime.replace(/:/, "min ");
  localTime += "s";
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
  const diffTime = Math.abs(date - now);
  const age = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365.25));
  if (!age || isNaN(age)) return "?";
  return age;
}

const getLimitDateForPhase2 = (cohort) => {
  if (cohort === "2019") return "23 mars 2021";
  if (cohort === "2020") return "31 décembre 2021 ";
  return "30 juin 2022";
};

const COHESION_STAY_END = {
  2019: new Date("06/28/2019"),
  2020: new Date("07/02/2021"),
  2021: new Date("07/02/2021"),
  "Février 2022": new Date("02/25/2022"),
  "Juin 2022": new Date("06/24/2022"),
  "Juillet 2022": new Date("07/15/2022"),
};

module.exports = {
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
  getLimitDateForPhase2,
  formatLongDateUTCWithoutTime,
  COHESION_STAY_END,
};
