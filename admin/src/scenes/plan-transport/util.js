export function formatRate(value, total, fractionDigit = 0) {
  if (total === 0 || total === undefined || total === null || value === undefined || value === null) {
    return "-";
  } else {
    return ((value / total) * 100).toFixed(fractionDigit).replace(/\./g, ",") + "%";
  }
}
