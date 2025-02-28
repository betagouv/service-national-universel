import { SelectedFilters } from "@/components/filters-system-v2";
import { getCohortGroups } from "@/services/cohort.service";
import React, { createContext, useState } from "react";

import Loader from "@/components/Loader";
import { useSelector } from "react-redux";
import ListeDiffusionFilters from "./ListeDiffusionFilters";
import useFilterLabels from "@/scenes/volontaires/useFilterLabels";
import { getFilterArray } from "@/scenes/volontaires/utils";
import { Filter } from "@/components/filters-system-v2/components/Filters";

export interface ListeDiffusionFilterProps {
  paramData: any;
  dataFilter: any;
  filters: any;
  id: string;
}

export interface ListeDiffusionFilterContextProps {
  keyPrefix: string;
}
export const ListeDiffusionFilterContext: React.Context<ListeDiffusionFilterContextProps> = createContext({ keyPrefix: "" });

export default function ListeDiffusionFilterWrapper({ paramData, dataFilter, filters, id }: ListeDiffusionFilterProps) {
  const [selectedFilters, setSelectedFilters] = useState<{ [key: string]: Filter }>({ originalCohort: { filter: ["CLE juin 2024"] } });

  const handleFilterChange = (filters: any) => {
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
          <SelectedFilters filterArray={filters} selectedFilters={selectedFilters} setSelectedFilters={handleFilterChange} paramData={paramData} setParamData={() => {}} />
        </div>
      </div>
    </ListeDiffusionFilterContext.Provider>
  );
}
