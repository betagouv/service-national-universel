import { SelectedFilters } from "@/components/filters-system-v2";
import { getCohortGroups } from "@/services/cohort.service";
import React, { createContext, useState } from "react";

import { Filter } from "@/components/filters-system-v2/components/Filters";
import { ListeDiffusionFiltres } from "snu-lib";
import ListeDiffusionFilters from "./ListeDiffusionFilters";

export interface ListeDiffusionFilterProps {
  paramData: { page: number; sort: object; filters: Record<string, { key: string }> };
  dataFilter: Record<string, { key: string }>;
  filters: Filter[];
  id?: string;
  selectedFilters?: ListeDiffusionFiltres;
  onFiltersChange: (filters: ListeDiffusionFiltres) => void;
}

export interface ListeDiffusionFilterContextProps {
  keyPrefix?: string;
}
export const ListeDiffusionFilterContext: React.Context<ListeDiffusionFilterContextProps> = createContext({});

export default function ListeDiffusionFilterWrapper({ paramData, dataFilter, filters, id, selectedFilters = {}, onFiltersChange }: ListeDiffusionFilterProps) {
  console.log("Filters", filters);

  const formattedSelectedFilter: { [key: string]: { filter: string[] } } =
    Object.fromEntries(Object.entries(selectedFilters).map(([key, value]) => [key, { filter: value }])) || {};

  const handleFilterChange = (filters: { [key: string]: { filter: string[] } }) => {
    const formattedUpdatedFilters = Object.fromEntries(Object.entries(filters).map(([key, value]) => [key, value.filter]));
    onFiltersChange(formattedUpdatedFilters);
  };

  return (
    <ListeDiffusionFilterContext.Provider value={{ keyPrefix: id }}>
      <div className="flex">
        <ListeDiffusionFilters
          filters={filters}
          selectedFilters={formattedSelectedFilter}
          onFiltersChange={handleFilterChange}
          intermediateFilters={[getCohortGroups()]}
          dataFilter={dataFilter}
        />
      </div>
      <div className="mt-2 flex flex-row flex-wrap items-center">
        <SelectedFilters
          filterArray={filters}
          selectedFilters={formattedSelectedFilter}
          setSelectedFilters={handleFilterChange}
          paramData={paramData}
          setParamData={() => {}}
          disabled={false}
        />
      </div>
    </ListeDiffusionFilterContext.Provider>
  );
}
