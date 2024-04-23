import React, { useState } from "react";
import FilterPopOver from "./FilterPopOver";
import { Filter, SubFilter } from "../Filter";

export type SubFilterPopOverProps = {
  selectedFilters: any;
  subFilters: SubFilter;
  setSelectedFilters: any;
  setParamData: any;
  dataFilter: { [key: string]: DataFilter };
  setFilter: any;
  filter: any;
};

export type DataFilter = {
  key: string;
};

export const SubFilterPopOver = ({ selectedFilters, setSelectedFilters, setParamData, subFilters, dataFilter, setFilter, filter }: SubFilterPopOverProps) => {
  const [isShowingSubFilter, setIsShowingSubFilter] = useState(false);
  return subFilters.filters.map((subFilter) => {
    const dataOnDropDown: DataFilter = subFilter?.filter(dataFilter);
    console.log(filter);
    // console.log(setFilter("cohort"));
    return (
      <FilterPopOver
        key={"sub-" + subFilter.name}
        filter={subFilter}
        selectedFilters={subFilters}
        setSelectedFilters={setSelectedFilters}
        data={dataOnDropDown}
        isShowing={isShowingSubFilter === subFilter.name}
        setIsShowing={(value) => setIsShowingSubFilter(value)}
        setParamData={setParamData}
      />
    );
  });
};
