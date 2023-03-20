import React from "react";
import ReactTooltip from "react-tooltip";
import { DropDown } from "./filters/FilterPopOver";
import { Popover } from "@headlessui/react";

export default function SelectedFilters({ filterArray, selectedFilters, setSelectedFilters, paramData, setParamData }) {
  return (
    <>
      {filterArray
        .filter((item) => selectedFilters[item.name] && selectedFilters[item.name].filter.length > 0)
        .map((filter) => (
          <div key={filter.title} className="relative">
            <div className={`p-0.5 border-[2px] ${paramData?.isShowing === filter.name ? "  border-blue-600 rounded-xl" : "border-transparent"}`}>
              <div
                onClick={() => setParamData((oldValue) => ({ ...oldValue, isShowing: filter.name }))}
                className=" cursor-pointer flex flex-row border-[1px] border-gray-200 rounded-md w-fit p-2 items-center gap-1">
                <div className="text-gray-700 font-medium text-xs">{filter.title} :</div>
                {selectedFilters[filter.name].filter.map((item, index) => {
                  // on affiche que les 2 premiers filtres, apres on affiche "+x"
                  if (index > 2) {
                    if (index === selectedFilters[filter.name].filter.length - 1) {
                      return (
                        <div key={item}>
                          <ToolTipView selectedFilters={selectedFilters} filter={filter} />
                          <div data-tip="" data-for={"tooltip-filtre" + filter.name} className="bg-gray-100 rounded py-1 px-2 text-xs text-gray-500">
                            +{index - 2}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }
                  return (
                    <div className="bg-gray-100 rounded py-1 px-2 text-xs text-gray-500" key={item}>
                      {item === "N/A" ? filter.missingLabel : filter?.translate ? filter.translate(item) : item}
                    </div>
                  );
                })}
              </div>
            </div>

            <Popover className="absolute">
              <DropDown
                filter={filter}
                selectedFilters={selectedFilters}
                setSelectedFilters={setSelectedFilters}
                data={paramData?.filters ? paramData.filters[filter.name] : []}
                isShowing={paramData?.isShowing === filter.name}
                setParamData={setParamData}
                inListFilter={false}
              />
            </Popover>
          </div>
        ))}
    </>
  );
}

const ToolTipView = ({ selectedFilters, filter }) => {
  return (
    <ReactTooltip id={"tooltip-filtre" + filter.name} className="bg-white shadow-xl text-black !opacity-100" arrowColor="white" disable={false}>
      <div className="flex flex-row gap-2 flex-wrap max-w-[600px] rounded">
        {selectedFilters[filter.name].filter.map((item) => (
          <div className="bg-gray-100 rounded py-1 px-2 text-xs text-gray-500" key={item}>
            {item === "N/A" ? filter.missingLabel : filter?.translate ? filter.translate(item) : item}
          </div>
        ))}
      </div>
    </ReactTooltip>
  );
};
