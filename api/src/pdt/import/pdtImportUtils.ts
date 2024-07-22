const { departmentLookUp } = require("snu-lib");

export function isValidDate(date) {
  return date.match(/^[0-9]{2}\/[0-9]{2}\/202[0-9]$/);
}

export function formatTime(time) {
  let [hours, minutes] = time.split(":");
  hours = hours.length === 1 ? "0" + hours : hours;
  return `${hours}:${minutes}`;
}

export function isValidTime(time) {
  const test = formatTime(time);
  return test.match(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/);
}

export function isValidNumber(number) {
  return number.match(/^[0-9]+$/);
}

export function isValidBoolean(b) {
  return b
    .trim()
    .toLowerCase()
    .match(/^(oui|non)$/);
}

export function isValidDepartment(department) {
  const ids = Object.keys(departmentLookUp);
  return ids.includes((department || "").toUpperCase());
}
