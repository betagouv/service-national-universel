export const formatDay = (date) => {
  if (!date) return "-";
  return new Date(date).toISOString().split("T")[0];
};

export const formatStringLongDate = (date) => {
  if (!date) return "-";
  const d = new Date(date);
  return d.toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });
};

export const formatStringDate = (date) => {
  if (!date) return "-";
  const d = new Date(date);
  return d.toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" });
};
