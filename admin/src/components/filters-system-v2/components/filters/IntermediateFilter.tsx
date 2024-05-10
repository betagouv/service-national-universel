import React, { useState } from "react";
import FilterPopOver from "./FilterPopOver";
import { RowFilter, IIntermediateFilter, DataFilter } from "../Filter";

export type IntermediateFilterProps = {
  selectedFilters: { [key: string]: { filter: string[] } };
  intermediateFilter: IIntermediateFilter;
  setSelectedFilters: any;
  setParamData: any;
  dataFilter: { [key: string]: DataFilter[] };
  setFilter?: any;
  filter?: any;
};

export const isEverySubValueChecked = (filter: RowFilter, selectedFilters, dataOnDropDown: DataFilter[]) => {
  return (dataOnDropDown.length !== 0 && selectedFilters[filter.name]?.filter?.length === dataOnDropDown.length) || false;
};

export const syncRootFilter = (intermediateFilter: IIntermediateFilter, newSelectedFilters: { [key: string]: { filter: string[] } }) => {
  if (!intermediateFilter) return;
  newSelectedFilters[intermediateFilter.key].filter = [];
  for (const filter of intermediateFilter.filters) {
    if (newSelectedFilters[filter.name] && newSelectedFilters[intermediateFilter.key]) {
      newSelectedFilters[intermediateFilter.key].filter = [...newSelectedFilters[intermediateFilter.key].filter, ...(newSelectedFilters[filter.name].filter || [])];
    }
  }
};

export const IntermediateFilter = ({ selectedFilters, setSelectedFilters, setParamData, intermediateFilter, dataFilter, setFilter, filter }: IntermediateFilterProps) => {
  const [isShowingIntermediateFilter, setIsShowingIntermediateFilter] = useState(false);

  const check = (filter: RowFilter, dataOnDropDown: DataFilter[]) => {
    let newIntermediateFilters = dataOnDropDown.map((data) => data.key);
    if (isEverySubValueChecked(filter, selectedFilters, dataOnDropDown)) {
      newIntermediateFilters = [];
    }
    const newSelectedFilters = {
      ...selectedFilters,
      [filter.name]: { filter: newIntermediateFilters },
    };
    syncRootFilter(intermediateFilter, newSelectedFilters);

    setSelectedFilters(newSelectedFilters);
  };

  return (
    <>
      {intermediateFilter.filters.map((filter: RowFilter) => {
        const dataOnDropDown: DataFilter[] = filter?.filterRootFilter(dataFilter[filter.parentFilter]);

        return (
          <div className="flex cursor-pointer px-3 hover:bg-gray-50" key={`${filter.title}`}>
            <input
              key={"input-intermediate-" + filter.name}
              type="checkbox"
              checked={isEverySubValueChecked(filter, selectedFilters, dataOnDropDown)}
              onChange={() => check(filter, dataOnDropDown)}
            />
            <div className="flex-grow">
              <FilterPopOver
                key={"intermediate-" + filter.name}
                filter={filter}
                selectedFilters={selectedFilters}
                setSelectedFilters={setSelectedFilters}
                data={dataOnDropDown}
                setIsShowing={(value) => setIsShowingIntermediateFilter(value)}
                setParamData={setParamData}
                intermediateFilter={intermediateFilter}
              />
            </div>
          </div>
        );
      })}
    </>
  );
};
export type IntermediateFilterCountProps = {
  dataOnDropDown: DataFilter[];
};
export const IntermediateFilterCount = ({ dataOnDropDown }: IntermediateFilterCountProps) => {
  const docCount = dataOnDropDown?.reduce((acc, curr) => acc + curr.doc_count, 0);
  return <div className=" justify-content-end text-xs leading-5 text-gray-500">{docCount}</div>;
};
