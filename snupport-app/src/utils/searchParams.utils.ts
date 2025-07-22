const parseJSONParam = (param) => {
  try {
    return param ? JSON.parse(param) : [];
  } catch {
    return [];
  }
};

export function getFiltersFromUrl(filterKeys: Record<string, any>) {
  const searchParams = new URLSearchParams(window.location.search);
  return Object.fromEntries(
    Object.entries(filterKeys).map(([key, defaultValue]) => {
      if (key === "page" || key === "size") {
        return [key, searchParams.get(key) ?? defaultValue];
      } else if (Array.isArray(defaultValue)) {
        return [key, parseJSONParam(searchParams.get(key))];
      } else if (typeof defaultValue === "object" && defaultValue !== null) {
        const urlValue = searchParams.get(key);
        if (urlValue) {
          try {
            return [key, JSON.parse(urlValue)];
          } catch {
            return [key, defaultValue];
          }
        }
        return [key, defaultValue];
      } else {
        return [key, searchParams.get(key) || defaultValue];
      }
    })
  );
}

export function formatSearchString(filter: Record<string, any>): string {
  const newSearchParams = new URLSearchParams(window.location.search);
  Object.entries(filter).forEach(([key, value]) => {
    const shouldExclude =
      !value ||
      (Array.isArray(value) && value.length === 0) ||
      ((key === "creationDate" || key === "lastActivityDate") &&
        typeof value === "object" &&
        value !== null &&
        (!value.from || value.from === "") &&
        (!value.to || value.to === ""));

    if (shouldExclude) {
      newSearchParams.delete(key);
    } else {
      if (Array.isArray(value)) {
        newSearchParams.set(key, JSON.stringify(value));
      } else if (typeof value === "object" && value !== null) {
        newSearchParams.set(key, JSON.stringify(value));
      } else {
        newSearchParams.set(key, String(value));
      }
    }
  });
  return newSearchParams.toString();
}
