import React, { Fragment } from "react";

import ReactTooltip from "react-tooltip";
import FilterSvg from "../../../assets/icons/Filter";
import { Popover, Transition } from "@headlessui/react";
import Trash from "../../../assets/icons/Trash";
import { normalizeString } from "../../../components/filters-system-v2/components/filters/utils";

export const FilterDashBoard = ({ selectedFilters, setSelectedFilters, filterArray }) => {
  return (
    <div className="flex w-full flex-row justify-between rounded-lg border-[1px] border-gray-200 bg-white py-4 px-4">
      <div className="flex h-[50px] flex-row items-center justify-center gap-2 self-start">
        <FilterSvg className="h-4 w-4 text-gray-300" />
        <div className="text-lg font-bold text-gray-900">Filtres</div>
      </div>
      <div className="w-7/10 flex flex-row flex-wrap items-center justify-end gap-2">
        {filterArray.map((filter) => (
          <FilterComponent key={filter.id} filter={filter} selectedFilters={selectedFilters} setSelectedFilters={setSelectedFilters} />
        ))}
      </div>
    </div>
  );
};

export const FilterComponent = ({ filter, selectedFilters, setSelectedFilters, maxItems = 3 }) => {
  const selectedFilterValues = selectedFilters[filter.id]?.length ? selectedFilters[filter.id] : [];
  const [visible, setVisible] = React.useState(false);

  return (
    <div className="relative w-fit">
      <div className={`border-[2px] p-0.5 ${visible ? "rounded-xl border-blue-600" : "border-transparent"}`}>
        <div
          onClick={() => setVisible(true)}
          className="flex cursor-pointer flex-row items-center gap-1 rounded-md border-[1px] border-gray-200 bg-[#FFFFFF] p-2 hover:border-gray-300">
          <div className="text-xs font-medium text-gray-700">{filter.name}</div>
          {selectedFilterValues?.length === filter.options?.length ? (
            <div className="rounded bg-gray-100 py-1 px-2 text-xs text-gray-500">{filter?.fullValue}</div>
          ) : selectedFilterValues.length > 0 ? (
            selectedFilterValues
              .sort((a, b) => a.localeCompare(b))
              .map((item, index) => {
                const label = filter.options.find((option) => option.key === item)?.label;
                if (index > maxItems - 1) {
                  if (index === selectedFilterValues.length - 1) {
                    return (
                      <div key={item}>
                        <ToolTipView selectedFilterValues={selectedFilterValues} filter={filter} />
                        <div data-tip="" data-for={"tooltip-filtre" + filter.id} className="rounded bg-gray-100 py-1 px-2 text-xs text-gray-500">
                          +{index - maxItems + 1}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }
                return (
                  <div className="rounded bg-gray-100 py-1 px-2 text-xs text-gray-500" key={item}>
                    {label}
                  </div>
                );
              })
          ) : (
            <div className="rounded bg-gray-100 py-1 px-2 text-xs text-gray-500">{filter?.fullValue ? filter.fullValue : "Choisir"}</div>
          )}
        </div>
      </div>

      <Popover className="relative">
        <DropDown filter={filter} visible={visible} setVisible={setVisible} selectedFilters={selectedFilters} setSelectedFilters={setSelectedFilters} />
      </Popover>
    </div>
  );
};

const ToolTipView = ({ selectedFilterValues, filter }) => {
  return (
    <ReactTooltip id={"tooltip-filtre" + filter.id} className="bg-white text-black !opacity-100 shadow-xl" arrowColor="white" disable={false}>
      <div className="flex max-w-[600px] flex-row flex-wrap gap-2 rounded">
        {selectedFilterValues.map((item) => {
          const found = filter.options.find((option) => option.key === item);
          const label = found?.label;
          return (
            <div className="rounded bg-gray-100 py-1 px-2 text-xs text-gray-500" key={item}>
              {label}
            </div>
          );
        })}
      </div>
    </ReactTooltip>
  );
};

const DropDown = ({ filter, selectedFilters, setSelectedFilters, visible, setVisible }) => {
  const [search, setSearch] = React.useState("");
  const data = filter.options;
  const [optionsVisible, setOptionsVisible] = React.useState(data || []);
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (filter?.sort) {
      setOptionsVisible(filter.sort(data));
    } else {
      setOptionsVisible(data);
    }
  }, [data]);

  React.useEffect(() => {
    // normalize search
    const normalizedSearch = normalizeString(search);
    const newData = search !== "" ? data.filter((f) => normalizeString(f.key).includes(normalizedSearch)) : data;
    setOptionsVisible(newData);
  }, [search]);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setVisible(false);
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  const handleSelect = (value) => {
    // check si c'est un isSingle (un seul filtre possible)
    if (filter?.isSingle) return setSelectedFilters({ ...selectedFilters, [filter?.id]: [value] });
    if (filter?.fixed?.includes(value)) return;
    let newFilters;
    // store localement les filtres
    if (selectedFilters[filter?.id]) {
      if (selectedFilters[filter?.id]?.includes(value)) {
        newFilters = selectedFilters[filter?.id]?.filter((f) => f !== value);
      } else {
        newFilters = selectedFilters[filter?.id]?.concat(value);
      }
    } else {
      newFilters = [value];
    }
    // concat array without doublon --> Set is Array without doublon
    if (filter?.fixed && newFilters.length > 0) newFilters = [...new Set([...newFilters, ...filter.fixed])];

    setSelectedFilters({ ...selectedFilters, [filter?.id]: newFilters });
  };
  const handleDelete = () => {
    if (filter?.fixed) return setSelectedFilters((selectedFilters) => ({ ...selectedFilters, [filter?.id]: filter.fixed }));
    setSelectedFilters((selectedFilters) => ({ ...selectedFilters, [filter?.id]: [] }));
  };
  return (
    <Transition
      as={Fragment}
      show={visible}
      enter="transition ease-out duration-200"
      enterFrom="opacity-0 translate-y-1"
      enterTo="opacity-100 translate-y-0"
      leave="transition ease-in duration-150"
      leaveFrom="opacity-100 translate-y-0"
      leaveTo="opacity-0 translate-y-1">
      <Popover.Panel className={`absolute right-0 z-30 w-[305px] translate-y-[4px]`}>
        <div ref={ref} className="rounded-lg shadow-lg ">
          <div className="relative grid rounded-lg border-[1px] border-gray-100 bg-white py-2">
            {filter?.customComponent ? (
              filter.customComponent(handleSelect, selectedFilters[filter?.id])
            ) : (
              <>
                <div className="mb-1 flex items-center justify-between py-2 px-3">
                  <p className="text-xs font-light leading-5 text-gray-500">{filter.name}</p>
                  {filter.allowEmpty === false ? <></> : <Trash className="h-3 w-3 cursor-pointer font-light text-red-500" onClick={handleDelete} />}
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="mx-3 mb-2 truncate rounded-lg bg-gray-100 px-3 py-2 text-xs text-gray-900 placeholder:text-gray-600"
                  placeholder={`Rechercher un(e) ${filter?.name.toLowerCase()}...`}
                />
                <div className="flex max-h-[400px] flex-col overflow-y-auto">
                  {optionsVisible?.length === 0 ? (
                    <div className="flex items-center justify-center py-2 px-3">
                      <p className="text-xs leading-5 text-gray-500">Aucun résultat</p>
                    </div>
                  ) : (
                    <>
                      {optionsVisible
                        ?.sort((a, b) => {
                          if (filter?.translate) {
                            return filter.translate(a.key)?.toString().localeCompare(filter.translate(b.key)?.toString());
                          }
                          a.key?.toString().localeCompare(b.key?.toString());
                        })

                        ?.map((option) => {
                          const optionSelected = filter?.fixed?.includes(option.key) || (selectedFilters[filter.id]?.length && selectedFilters[filter?.id]?.includes(option?.key));
                          return (
                            <div
                              className="flex cursor-pointer items-center justify-between py-2 px-3 hover:bg-gray-50"
                              key={option?.key}
                              onClick={() => handleSelect(option?.key)}>
                              <div className="flex items-center gap-2 text-sm leading-5 text-gray-700">
                                <input type="checkbox" disabled={filter?.fixed?.includes(option.key)} checked={optionSelected} onChange={() => {}} />
                                {option.key === "N/A" ? filter.missingLabel : filter?.translate ? filter.translate(option?.key) : option?.key}
                              </div>
                            </div>
                          );
                        })}
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </Popover.Panel>
    </Transition>
  );
};

export const currentFilterAsUrl = (filters) => {
  let selectedFilters = {};
  Object.keys(filters)?.forEach((key) => {
    if (filters[key]?.length > 0) selectedFilters[key] = filters[key];
  });
  const length = Object.keys(selectedFilters).length;
  let index = 0;
  let url = Object.keys(selectedFilters)?.reduce((acc, curr) => {
    if (selectedFilters[curr]?.length > 0) {
      acc += `${curr}=${selectedFilters[curr]?.join(",")}${index < length - 1 ? "&" : ""}`;
    } else return acc;

    index++;
    return acc;
  }, "");
  url += `${url !== "" ? "&" : ""}page=1`;

  return url;
};
