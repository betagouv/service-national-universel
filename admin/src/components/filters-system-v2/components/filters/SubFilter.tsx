import React, { useState } from "react";
import FilterPopOver from "./FilterPopOver";
import { Filter, CustomFilter, DataFilter } from "../Filter";

export type SubFilterPopOverProps = {
  selectedFilters: { [key: string]: { filter: string[] } };
  subFilter: CustomFilter;
  setSelectedFilters: any;
  setParamData: any;
  dataFilter: { [key: string]: DataFilter[] };
  setFilter?: any;
  filter?: any;
};

export const isEverySubValueChecked = (filter: Filter, selectedFilters, dataOnDropDown: DataFilter[]) => {
  return (dataOnDropDown.length !== 0 && selectedFilters[filter.name]?.filter?.length === dataOnDropDown.length) || false;
};

export const syncRootFilter = (subFilter: CustomFilter, newSelectedFilters: { [key: string]: { filter: string[] } }) => {
  if (!subFilter) return;
  newSelectedFilters[subFilter.key].filter = [];
  for (const filter of subFilter.filters) {
    if (newSelectedFilters[filter.name] && newSelectedFilters[subFilter.key]) {
      newSelectedFilters[subFilter.key].filter = [...newSelectedFilters[subFilter.key].filter, ...(newSelectedFilters[filter.name].filter || [])];
    }
  }
};

export const SubFilterPopOver = ({ selectedFilters, setSelectedFilters, setParamData, subFilter, dataFilter, setFilter, filter }: SubFilterPopOverProps) => {
  const [isShowingSubFilter, setIsShowingSubFilter] = useState(false);

  const check = (filter: Filter, dataOnDropDown: DataFilter[]) => {
    let newSubFilters = dataOnDropDown.map((data) => data.key);
    if (isEverySubValueChecked(filter, selectedFilters, dataOnDropDown)) {
      newSubFilters = [];
    }
    const newSelectedFilters = {
      ...selectedFilters,
      [filter.name]: { filter: newSubFilters },
    };
    syncRootFilter(subFilter, newSelectedFilters);

    setSelectedFilters(newSelectedFilters);
  };

  return (
    <>
      {subFilter.filters.map((filter: Filter) => {
        const dataOnDropDown: DataFilter[] = filter?.filterRootFilter(dataFilter[filter.parentFilter]);

        return (
          <div className="flex cursor-pointer px-3 hover:bg-gray-50" key={`${filter.title}`}>
            <input
              key={"input-sub-" + filter.name}
              type="checkbox"
              checked={isEverySubValueChecked(filter, selectedFilters, dataOnDropDown)}
              onChange={() => check(filter, dataOnDropDown)}
            />
            <div className="flex-grow">
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
            </div>
          </div>
        );
      })}
    </>
  );
};
export type SubFilterCountProps = {
  dataOnDropDown: DataFilter[];
};
export const SubFilterCount = ({ dataOnDropDown }: SubFilterCountProps) => {
  const docCount = dataOnDropDown?.reduce((acc, curr) => acc + curr.doc_count, 0);
  return <div className=" justify-content-end text-xs leading-5 text-gray-500">{docCount}</div>;
};
