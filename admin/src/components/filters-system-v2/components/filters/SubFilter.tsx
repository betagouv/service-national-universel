import React, { useState } from "react";
import FilterPopOver from "./FilterPopOver";
import { Filter, SubFilter } from "../Filter";

export type SubFilterPopOverProps = {
  selectedFilters: { [key: string]: { filter: string[] } };
  subFilter: SubFilter;
  setSelectedFilters: any;
  setParamData: any;
  dataFilter: { [key: string]: DataFilter };
  setFilter?: any;
  filter?: any;
};

export type DataFilter = {
  key: string;
};

export const SubFilterPopOver = ({ selectedFilters, setSelectedFilters, setParamData, subFilter, dataFilter, setFilter, filter }: SubFilterPopOverProps) => {
  const [isShowingSubFilter, setIsShowingSubFilter] = useState(false);
  return (
    <>
      {subFilter.filters.map((filter: Filter) => {
        const dataOnDropDown: DataFilter = filter?.filterSubFilter(dataFilter);
        return (
          <FilterPopOver
            key={"sub-" + filter.name}
            filter={filter}
            selectedFilters={selectedFilters}
            setSelectedFilters={setSelectedFilters}
            data={dataOnDropDown}
            setIsShowing={(value) => setIsShowingSubFilter(value)}
            setParamData={setParamData}
            subFilter={subFilter}
          />
        );
      })}
    </>
  );
};
