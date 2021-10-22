export const formatDay = (date) => {
  if (!date) return "-";
  return new Date(date).toISOString().split("T")[0];
};

export const formatDateFR = (d) => {
  if (!d) return "-";
  const date = new Date(d);
  return date.toLocaleDateString("fr-FR");
};
export const formatLongDateFR = (d) => {
  if (!d) return "-";
  const date = new Date(d);
  return date.toLocaleDateString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};
export const formatDateFRTimezoneUTC = (d) => {
  if (!d) return "-";
  const date = new Date(d);
  return date.toLocaleDateString("fr-FR", {
    timeZone: "UTC",
  });
};
export const formatLongDateUTC = (d) => {
  if (!d) return "-";
  const date = new Date(d);
  return date.toLocaleDateString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
};

export const formatStringLongDate = (date) => {
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

export const formatStringDate = (date) => {
  if (!date) return "-";
  const d = new Date(date);
  return d.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatStringDateTimezoneUTC = (date) => {
  if (!date) return "-";
  const d = new Date(date);
  return d.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
};

export function dateForDatePicker(d) {
  return new Date(d).toISOString().split("T")[0];
}

export function getAge(d) {
  const now = new Date().toTimeString();
  const date = new Date(d).toTimeString();
  const diffTime = Math.abs(Number(date) - Number(now));
  const age = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365));
  if (!age || isNaN(age)) return "?";
  return age;
}

export const getLimitDateForPhase2 = (cohort) => {
  if (cohort === "2019") return "23 mars 2021";
  if (cohort === "2020") return "31 décembre 2021 ";
  return "30 juin 2022";
};
