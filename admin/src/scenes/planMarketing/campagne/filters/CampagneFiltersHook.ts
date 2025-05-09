import { useState, useCallback } from "react";

export interface CampagneFiltersBase {
  isArchived?: boolean;
  isProgrammationActive?: boolean;
  hasGenericLink?: boolean;
}

export const useCampagneFilters = <T extends CampagneFiltersBase>(onChange: (filters: T) => void, initialFilters: Partial<T> = {} as Partial<T>) => {
  const [filters, setFiltersState] = useState<T>({ ...initialFilters } as T);

  const setFilters = useCallback(
    (newFilters: T) => {
      setFiltersState(newFilters);
      onChange(newFilters);
    },
    [onChange],
  );

  const updateFilter = useCallback(
    <K extends keyof T>(key: K, value: T[K]) => {
      setFiltersState((prev) => {
        const newFilters = { ...prev, [key]: value };
        onChange(newFilters);
        return newFilters;
      });
    },
    [onChange],
  );

  return {
    filters,
    updateFilter,
    setFilters,
  };
};
