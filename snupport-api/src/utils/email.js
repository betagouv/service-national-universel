const weekendRanges = [
  { start: new Date("2025-03-01"), end: new Date("2025-03-02") }, //CLE 07
  { start: new Date("2025-03-08"), end: new Date("2025-03-09") }, //CLE 08
  { start: new Date("2025-03-15"), end: new Date("2025-03-16") }, //CLE 09
  { start: new Date("2025-03-22"), end: new Date("2025-03-23") }, //CLE 10
  { start: new Date("2025-03-29"), end: new Date("2025-03-30") }, //CLE 11
  { start: new Date("2025-04-12"), end: new Date("2025-04-13") }, // Avril Corse
  { start: new Date("2025-04-26"), end: new Date("2025-04-27") }, // CLE 15
  { start: new Date("2025-05-03"), end: new Date("2025-05-04") }, // CLE 16
  { start: new Date("2025-05-10"), end: new Date("2025-05-11") }, // CLE 17
  { start: new Date("2025-05-17"), end: new Date("2025-05-18") }, // CLE 18
  { start: new Date("2025-05-24"), end: new Date("2025-05-25") }, // CLE 19
  { start: new Date("2025-05-31"), end: new Date("2025-06-01") }, // CLE 20
  { start: new Date("2025-08-04"), end: new Date("2025-08-22") }, // Fermeture estivale startup
  { start: new Date("2025-12-22"), end: new Date("2026-01-04") }, // Fermeture hivernale support
];

function isDateInRange(newDate, ranges) {
  return ranges.some(({ start, end }) => newDate >= start && newDate <= end);
}
module.exports = {
  weekendRanges,
  isDateInRange,
};
