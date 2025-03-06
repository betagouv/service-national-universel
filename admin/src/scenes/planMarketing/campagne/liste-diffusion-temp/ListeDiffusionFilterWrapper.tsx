import { SelectedFilters } from "@/components/filters-system-v2";
import { getCohortGroups } from "@/services/cohort.service";
import React, { createContext, useState } from "react";

import { Filter } from "@/components/filters-system-v2/components/Filters";
import ListeDiffusionFilters from "./ListeDiffusionFilters";
import { ListeDiffusionFiltres } from "snu-lib";

export interface ListeDiffusionFilterProps {
  paramData: any;
  dataFilter: any;
  filters: any;
  id: string;
  savedFilter?: ListeDiffusionFiltres;
}

export interface ListeDiffusionFilterContextProps {
  keyPrefix: string;
}
export const ListeDiffusionFilterContext: React.Context<ListeDiffusionFilterContextProps> = createContext({ keyPrefix: "" });

export default function ListeDiffusionFilterWrapper({ paramData, dataFilter, filters, id, savedFilter }: ListeDiffusionFilterProps) {
  const formattedSavedFilter = savedFilter ? Object.fromEntries(Object.entries(savedFilter).map(([key, value]) => [key, { filter: value }])) : {};
  const [selectedFilters, setSelectedFilters] = useState<{ [key: string]: Filter }>(formattedSavedFilter);

  const handleFilterChange = (filters: { [key: string]: Filter }) => {
    setSelectedFilters(filters);
  };

  return (
    <ListeDiffusionFilterContext.Provider value={{ keyPrefix: id }}>
      <div className="flex flex-col bg-white shadow-md p-6 m-6">
        <div className="flex">
          <div className="flex text-xl pr-2">Filtres</div>
          <ListeDiffusionFilters
            filters={filters}
            selectedFilters={selectedFilters}
            onFiltersChange={handleFilterChange}
            intermediateFilters={[getCohortGroups()]}
            dataFilter={dataFilter}
          />
        </div>
        <div className="mt-2 flex flex-row flex-wrap items-center">
          <SelectedFilters
            filterArray={filters}
            selectedFilters={selectedFilters}
            setSelectedFilters={handleFilterChange}
            paramData={paramData}
            setParamData={() => {}}
            disabled={false}
          />
        </div>
      </div>
    </ListeDiffusionFilterContext.Provider>
  );
}
