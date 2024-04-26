import React, { useState } from "react";
import FilterPopOver from "./FilterPopOver";
import { Filter, SubFilter } from "../Filter";

export type SubFilterPopOverProps = {
  selectedFilters: { [key: string]: { filter: string[] } };
  subFilters: SubFilter;
  setSelectedFilters: any;
  setParamData: any;
  dataFilter: { [key: string]: DataFilter };
  setFilter?: any;
  filter?: any;
};

export type DataFilter = {
  key: string;
};

export const SubFilterPopOver = ({ selectedFilters, setSelectedFilters, setParamData, subFilters, dataFilter, setFilter, filter }: SubFilterPopOverProps) => {
  const [isShowingSubFilter, setIsShowingSubFilter] = useState(false);
  return (
    <>
      {subFilters.filters.map((subFilter: Filter) => {
        const dataOnDropDown: DataFilter = subFilter?.filterSubFilter(dataFilter);
        return (
          <FilterPopOver
            key={"sub-" + subFilter.name}
            filter={subFilter}
            selectedFilters={selectedFilters}
            setSelectedFilters={setSelectedFilters}
            data={dataOnDropDown}
            isShowing={isShowingSubFilter === subFilter.name}
            setIsShowing={(value) => setIsShowingSubFilter(value)}
            setParamData={setParamData}
            subFilters={subFilters}
          />
        );
      })}
    </>
  );
};
