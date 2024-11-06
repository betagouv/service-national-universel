import React, { useMemo } from "react";
import ReactTooltip from "react-tooltip";
import { DropDown } from "./filters/FilterPopOver";
import { Popover } from "@headlessui/react";
import Trash from "../../../assets/icons/Trash";

export default function SelectedFilters({ filterArray, selectedFilters, setSelectedFilters, paramData, setParamData, disabled = false }) {
  // check if all filters are defaultValue if yes, we don't show the delete button
  const hasOnlyDefaultFiltersSelected = useMemo(
    () =>
      filterArray.every((filter) => {
        if (selectedFilters[filter.name]?.filter?.length > 0 && selectedFilters[filter.name]?.filter[0]?.toString().trim() !== "") {
          return filter?.defaultValue ? filter.defaultValue.join(",") === selectedFilters[filter.name].filter.join(",") : false;
        }
        return true;
      }),
    [selectedFilters],
  );
  const deleteFilters = () => {
    const newSelectedFilters = {};
    filterArray.forEach((filter) => {
      // check for defaultValue
      newSelectedFilters[filter.name] = { filter: filter?.defaultValue ? filter.defaultValue : [] };
    });
    setSelectedFilters(newSelectedFilters);
  };
  return (
    <>
      {filterArray
        .filter((item) => selectedFilters[item.name] && selectedFilters[item.name].filter.length > 0)
        .map((filter) => (
          <div key={filter.title} className="relative">
            <div className={`border-[2px] p-0.5 ${paramData?.isShowing === filter.name ? "  rounded-xl border-blue-600" : "border-transparent"}`}>
              <div
                onClick={() => {
                  if (disabled) return;
                  setParamData((oldValue) => ({ ...oldValue, isShowing: filter.name }));
                }}
                className={`flex w-fit flex-row items-center gap-1 rounded-md border-[1px] border-gray-200 py-1.5 pr-1.5 pl-[12px] hover:border-gray-300 ${
                  !disabled && "cursor-pointer"
                }`}>
                <div className="text-xs font-medium text-gray-700">{filter.title} :</div>
                {selectedFilters[filter.name].filter.map((item, index) => {
                  // on affiche que les 2 premiers filtres, apres on affiche "+x"
                  if (index > 2) {
                    if (index === selectedFilters[filter.name].filter.length - 1) {
                      return (
                        <div key={item}>
                          <ToolTipView selectedFilters={selectedFilters} filter={filter} />
                          <div data-tip="" data-for={"tooltip-filtre" + filter.name} className="rounded bg-gray-100 py-1 px-2 text-xs text-gray-500">
                            +{index - 2}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }
                  return (
                    <div className="rounded bg-gray-100 py-1 px-2 text-xs text-gray-500" key={item}>
                      {item === "N/A" ? filter.missingLabel : filter?.translate ? filter.translate(item) : item}
                    </div>
                  );
                })}
              </div>
            </div>
            {!disabled && (
              <Popover className="absolute">
                <DropDown
                  filter={filter}
                  selectedFilters={selectedFilters}
                  setSelectedFilters={setSelectedFilters}
                  data={filter?.disabledBaseQuery ? filter.options : paramData?.filters ? paramData.filters[filter.name] : []}
                  isShowing={paramData?.isShowing === filter.name}
                  setParamData={setParamData}
                  inListFilter={false}
                />
              </Popover>
            )}
          </div>
        ))}
      {!hasOnlyDefaultFiltersSelected && !disabled && (
        <div onClick={() => deleteFilters()} className="ml-1 flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded bg-gray-100 p-2 hover:bg-gray-200">
          <Trash className="h-[13.5px] w-3 font-light text-red-500 " />
        </div>
      )}
    </>
  );
}

const ToolTipView = ({ selectedFilters, filter }) => {
  return (
    <ReactTooltip id={"tooltip-filtre" + filter.name} className="bg-white text-black !opacity-100 shadow-xl" arrowColor="white" disable={false}>
      <div className="flex max-w-[600px] flex-row flex-wrap gap-2 rounded">
        {selectedFilters[filter.name].filter.map((item) => (
          <div className="rounded bg-gray-100 py-1 px-2 text-xs text-gray-500" key={item}>
            {item === "N/A" ? filter.missingLabel : filter?.translate ? filter.translate(item) : item}
          </div>
        ))}
      </div>
    </ReactTooltip>
  );
};
