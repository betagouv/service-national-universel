const formatDay = (date) => {
  if (!date) return "-";
  return new Date(date).toISOString().split("T")[0];
};

const formatDateFR = (d) => {
  if (!d) return "-";
  const date = new Date(d);
  return date.toLocaleDateString("fr-FR");
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

const formatStringAndDateLong = (date) => {
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
  const date = new Date(d);
  const diffTime = Math.abs(date - now);
  const age = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365));
  if (!age || isNaN(age)) return "?";
  return age;
}

const getLimitDateForPhase2 = (cohort) => {
  if (cohort === "2019") return "23 mars 2021";
  if (cohort === "2020") return "31 décembre 2021 ";
  return "30 juin 2022";
};

module.exports = {
  formatDay,
  formatDateFR,
  formatLongDateFR,
  formatDateFRTimezoneUTC,
  formatLongDateUTC,
  formatStringAndDateLong,
  formatStringDate,
  formatStringDateTimezoneUTC,
  dateForDatePicker,
  getAge,
  getLimitDateForPhase2,
};
