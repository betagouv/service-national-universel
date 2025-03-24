import { SelectedFilters } from "@/components/filters-system-v2";
import React, { createContext } from "react";

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

export interface ListeDiffusionFiltersContextProps {
  keyPrefix?: string;
}
export const ListeDiffusionFiltersContext: React.Context<ListeDiffusionFiltersContextProps> = createContext({});

// Legacy code
export default function ListeDiffusionFiltersWrapper({ paramData, dataFilter, filters, id, selectedFilters, onFiltersChange }: ListeDiffusionFilterProps) {
  const formattedSelectedFilter: { [key: string]: { filter: string[] } } =
    Object.fromEntries(Object.entries(selectedFilters || {}).map(([key, value]) => [key, { filter: value }])) || {};

  const handleFilterChange = (filters: { [key: string]: { filter: string[] } }) => {
    const formattedUpdatedFilters = Object.fromEntries(Object.entries(filters).map(([key, value]) => [key, value.filter]));
    onFiltersChange(formattedUpdatedFilters);
  };
  return (
    <ListeDiffusionFiltersContext.Provider value={{ keyPrefix: id }}>
      <div className="flex">
        <ListeDiffusionFilters filters={filters} selectedFilters={formattedSelectedFilter} onFiltersChange={handleFilterChange} dataFilter={dataFilter} />
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
    </ListeDiffusionFiltersContext.Provider>
  );
}
