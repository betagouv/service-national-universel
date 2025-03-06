import { Popover, PopoverButton, PopoverPanel, Transition } from "@headlessui/react";
import React, { Fragment, useEffect, useRef, useState } from "react";

import FilterSvg from "../../../../assets/icons/Filter";

import FilterPopOver from "@/components/filters-system-v2/components/filters/FilterPopOver";
import { IntermediateFilter } from "@/components/filters-system-v2/components/filters/IntermediateFilter";
import { normalizeString } from "@/components/filters-system-v2/components/filters/utils";
import { Filter } from "@/components/filters-system-v2/components/Filters";
import cx from "classnames";

interface ListeDiffusionFiltersProps {
  filters: Filter[];
  selectedFilters: { [key: string]: { filter: string[] } };
  onFiltersChange: (filters: { [key: string]: { filter: string[] } }) => void;
  dataFilter: any;
  intermediateFilters?: any[];
}

// Legacy code
// Copy from ES coupled component : @/components/filters-system-v2/components/Filters
export default function ListeDiffusionFilters({ filters, selectedFilters, onFiltersChange, dataFilter, intermediateFilters = [] }: ListeDiffusionFiltersProps) {
  const [search, setSearch] = useState("");
  const [filtersVisible, setFiltersVisible] = useState(filters);
  const [categories, setCategories] = useState<string[]>([]);
  const [isShowing, setIsShowing] = useState<string | boolean>(false);

  const ref = useRef<HTMLButtonElement>(null);
  const refFilter = useRef<HTMLDivElement>(null);

  const hasSomeFilterSelected =
    selectedFilters &&
    Object.keys(selectedFilters).find(
      (key) => selectedFilters[key]?.filter?.length && selectedFilters[key]?.filter?.[0]?.toString().trim() !== "" && filters.find((f) => f.name === key),
    );

  // Initialization
  useEffect(() => {
    const defaultFilters = getDefaultFilters();
    onFiltersChange({ ...defaultFilters, ...selectedFilters });

    // Click outside handler (close popover)
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target) && refFilter.current && !refFilter.current.contains(event.target)) {
        setIsShowing(false);
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  useEffect(
    function updateSearchSelectedFilter() {
      // normalize search
      const normalizedSearch = normalizeString(search);
      const newFilters = search !== "" ? filters.filter((f) => normalizeString(f.title).includes(normalizedSearch)) : filters;
      setFiltersVisible(newFilters);
    },
    [search],
  );

  useEffect(
    function updateCategories() {
      if (filtersVisible.length === 0) {
        setCategories([]);
        return;
      }
      const newCategories: string[] = [];
      filtersVisible?.forEach((f) => {
        if (!newCategories.includes(f.parentGroup!)) {
          newCategories.push(f.parentGroup!);
        }
      });
      setCategories(newCategories);
    },
    [filtersVisible],
  );

  const getDefaultFilters = () => {
    const newFilters = {};
    filters.map((f) => {
      if (f?.customComponent?.getQuery) {
        newFilters[f?.name || ""] = { filter: f.defaultValue, customComponentQuery: f.getQuery?.(f.defaultValue) };
      } else {
        newFilters[f?.name || ""] = { filter: f?.defaultValue ? f.defaultValue : [] };
      }
    });
    return newFilters;
  };

  return (
    <div>
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-row items-center justify-start gap-2">
          <Popover className="relative">
            {({ open }) => (
              <>
                <PopoverButton
                  ref={ref}
                  onClick={() => setIsShowing(!isShowing)}
                  className={cx(
                    open ? "ring-2 ring-blue-500 ring-offset-2" : "",
                    "flex h-[38px] cursor-pointer items-center gap-2 rounded-lg px-3 text-[14px] font-medium  outline-none",
                    hasSomeFilterSelected ? "bg-[#2563EB] text-white hover:bg-blue-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200",
                  )}>
                  <FilterSvg className={`${hasSomeFilterSelected ? "text-white" : "text-gray-400"} h-4 w-4`} />
                  <span>Filtres</span>
                </PopoverButton>

                <Transition
                  as={Fragment}
                  show={isShowing !== false}
                  enter="transition ease-out duration-200"
                  enterFrom="opacity-0 translate-y-1"
                  enterTo="opacity-100 translate-y-0"
                  leave="transition ease-in duration-150"
                  leaveFrom="opacity-100 translate-y-0"
                  leaveTo="opacity-0 translate-y-1">
                  <PopoverPanel ref={refFilter} className="absolute left-0 z-10 mt-2 w-[305px]">
                    <div className="rounded-lg shadow-lg">
                      <div className="relative grid rounded-lg border-[1px] border-gray-100 bg-white py-2">
                        <input
                          type="text"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          className="mx-2 mb-2 rounded-lg bg-gray-100 px-3 py-2 text-xs text-gray-900 placeholder:text-gray-600"
                          placeholder="Rechercher par..."
                        />
                        <div className="flex flex-col overflow-y-auto">
                          {categories.map((category, index) => (
                            <div key={"key-" + category || "default"}>
                              {index !== 0 && <hr className="my-2 border-gray-100" />}
                              <div className="px-4 text-xs font-light leading-5 text-gray-500">{category}</div>
                              {filtersVisible
                                ?.filter((f) => f.parentGroup === category)
                                ?.map((item) => {
                                  let customItem = item;
                                  const intermediateFilter = intermediateFilters?.find((intermediateFilter) => intermediateFilter.key === item.name);
                                  if (intermediateFilters.length > 0 && intermediateFilter && item.name === intermediateFilter?.key) {
                                    customItem = {
                                      ...item,
                                      allowEmpty: false,
                                      //@ts-ignore unknown property
                                      showCount: false,
                                      customComponent: (setFilter, filter) => (
                                        <IntermediateFilter
                                          selectedFilters={selectedFilters}
                                          setSelectedFilters={onFiltersChange}
                                          setParamData={() => {}}
                                          intermediateFilter={intermediateFilter}
                                          dataFilter={dataFilter}
                                          setFilter={setFilter}
                                        />
                                      ),
                                    };
                                  }
                                  return (
                                    <FilterPopOver
                                      key={item.title}
                                      //@ts-ignore missing property
                                      filter={customItem}
                                      selectedFilters={selectedFilters}
                                      setSelectedFilters={onFiltersChange}
                                      data={item?.disabledBaseQuery ? item.options : dataFilter[item?.name || ""] || []}
                                      isShowing={isShowing === item.name}
                                      setIsShowing={(value) => setIsShowing(value)}
                                      setParamData={() => {}}
                                    />
                                  );
                                })}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </PopoverPanel>
                </Transition>
              </>
            )}
          </Popover>
        </div>
      </div>
    </div>
  );
}
