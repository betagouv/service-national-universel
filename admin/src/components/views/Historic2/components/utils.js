import { formatStringLongDate } from "snu-lib";
import { isIsoDate, translateModelFields } from "../../../../utils";

export function getOptions(data, key, translate) {
  const arr = data?.map((e) => e[key]);
  return [...new Set(arr)].map((e) => ({ label: translate ? translate(e) : e, value: e })).sort((a, b) => a.label.localeCompare(b.label));
}

export function filterEvent(filters, event) {
  if (filters.paths.length) return filters.paths.includes(event.path);
  if (filters.ops.length) return filters.ops.includes(event.op);
  if (filters.authors.length) return filters.authors.includes(event.author);
  if (filters.customFilter?.value?.length) {
    return filters.customFilter.value.some((value) => {
      return Object.entries(value).every(([key, value]) => value.includes(event[key]));
    });
  }
  if (filters.query) return searchEvent(event, filters.query);
  return true;
}

export function searchEvent(e, query, model) {
  const serializedQuery = query.toLowerCase().trim();
  const matchFieldName = translateModelFields(model, e.path).toLowerCase().includes(serializedQuery);
  const matchOriginalValue = (isIsoDate(e.originalValue) ? formatStringLongDate(e.originalValue) : e.originalValue)?.toLowerCase().includes(serializedQuery);
  const matchFromValue = (isIsoDate(e.value) ? formatStringLongDate(e.value) : e.value)?.toLowerCase().includes(serializedQuery);

  return matchFieldName || matchOriginalValue || matchFromValue;
}
