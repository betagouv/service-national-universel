import { Popover, Transition } from "@headlessui/react";
import React, { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { toastr } from "react-redux-toastr";

import FilterSvg from "../../../assets/icons/Filter";

import api from "../../../services/api";
import { debounce } from "@/utils";
import FilterPopOver from "@/components/filters-system-v2/components/filters/FilterPopOver";
import { IntermediateFilter } from "@/components/filters-system-v2/components/filters/IntermediateFilter";
import ViewPopOver from "@/components/filters-system-v2/components/filters/SavedViewPopOver";
import { normalizeString, buildQuery, getURLParam, currentFilterAsUrl } from "@/components/filters-system-v2/components/filters/utils";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export interface Filter {
  title?: string;
  name?: string;
  missingLabel?: string;
  translate?: (item: any) => any;
  filter?: any[];
  // custom ?
  parentGroup?: string;
  customComponent?: any;
  defaultValue?: string | string[];
  isSingle?: boolean;
  reduce?: (value: any[]) => any[];
  sort?: (value: any[]) => any[];
  getQuery?: (value: any) => any;
  allowEmpty?: boolean;
  disabledBaseQuery?: boolean;
  options?: any;
}

interface ListeDiffusionFiltersProps {
  key: string;
  route: string;
  pageId: string;
  filters: Filter[];
  setData: (data: any) => void;
  selectedFilters: { [key: string]: Filter };
  setSelectedFilters: (filters: { [key: string]: Filter }) => void;
  paramData: any;
  // setParamData: (data: any) => void;
  dataFilter: any;
  defaultUrlParam?: any;
  size?: any;
  intermediateFilters?: any[];
  disabled?: boolean;
}

export default function ListeDiffusionFilters({
  key,
  route,
  pageId,
  filters,
  // setData,
  selectedFilters,
  setSelectedFilters,
  // paramData,
  dataFilter,
  // setParamData,
  defaultUrlParam = undefined,
  // size,
  intermediateFilters = [],
  disabled = false,
}: ListeDiffusionFiltersProps) {
  const [search, setSearch] = useState("");
  // const [dataFilter, setDataFilter] = useState({});
  const [filtersVisible, setFiltersVisible] = useState(filters);
  const [categories, setCategories] = useState<string[]>([]);
  const [savedView, setSavedView] = useState([]);
  const [firstLoad, setFirstLoad] = useState(true);
  const [isShowing, setIsShowing] = useState<string | boolean>(false);

  const location = useLocation();
  const history = useHistory();

  const ref = useRef<HTMLButtonElement>(null);
  const refFilter = useRef<HTMLDivElement>(null);

  const hasSomeFilterSelected =
    selectedFilters &&
    Object.keys(selectedFilters).find(
      (key) => selectedFilters[key]?.filter?.length && selectedFilters[key]?.filter?.[0]?.toString().trim() !== "" && filters.find((f) => f.name === key),
    );

  // Initialization
  useEffect(() => {
    // updateFiltersFromParams(location.search);

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

  // const updateOnParamChange = useCallback(
  //   debounce(async (selectedFilters, paramData, location, route, size) => {
  //     buildQuery(route, selectedFilters, paramData?.page, filters, paramData?.sort, size).then((res) => {
  //       if (!res) return;
  //       setDataFilter({ ...dataFilter, ...res.newFilters });
  //       const newParamData: {
  //         count: number;
  //         filters: { [key: string]: Filter };
  //         page?: number;
  //       } = {
  //         count: res.count,
  //         filters: { ...dataFilter, ...res.newFilters },
  //       };
  //       if (paramData.count !== res.count && !firstLoad) newParamData.page = 0;
  //       setParamData((paramData) => ({ ...paramData, ...newParamData }));
  //       setData(res.data);
  //       if (firstLoad) setFirstLoad(false);

  //       // Hack: avoid unwanted refresh: https://stackoverflow.com/a/61596862/978690
  //       const search = `?${currentFilterAsUrl(selectedFilters, paramData?.page, filters, defaultUrlParam)}`;
  //       const { pathname } = history.location;
  //       if (location.search !== search) window.history.replaceState({ path: pathname + search }, "", pathname + search);
  //     });
  //   }, 250),
  //   [firstLoad],
  // );

  // useEffect(() => {
  //   if (Object.keys(selectedFilters).length === 0) return;
  //   // updateOnParamChange(selectedFilters, paramData, location, route, 10);
  // }, [selectedFilters, paramData.page, paramData.sort, location, route]);

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

  const updateSavedViewFromDbFilters = async () => {
    try {
      const res = await api.get("/filters/" + pageId);
      if (!res.ok) return toastr.error("Oops, une erreur est survenue lors du chargement des filtres", "");
      setSavedView(res.data);
    } catch (error) {
      console.log(error);
      toastr.error("Oops, une erreur est survenue lors du chargement des filtres", "");
    }
  };

  const handleDeleteFilter = async (id) => {
    // try {
    //   const res = await api.remove("/filters/" + id);
    //   if (!res.ok) return toastr.error("Oops, une erreur est survenue", "");
    //   toastr.success("Filtre supprimé avec succès", "");
    //   updateSavedViewFromDbFilters();
    //   return;
    // } catch (error) {
    //   console.log(error);
    // }
  };

  function updateFiltersFromParams(params) {
    const defaultFilters = getDefaultFilters();
    const initialFilters = getURLParam(new URLSearchParams(params), () => {}, filters);
    setSelectedFilters({ ...defaultFilters, ...initialFilters });
  }

  const handleSelectUrl = (params) => {
    updateFiltersFromParams(params);
    setIsShowing(false);
  };

  if (disabled) return null;

  return (
    <div>
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-row items-center justify-start gap-2">
          <Popover className="relative">
            {({ open }) => (
              <>
                <Popover.Button
                  ref={ref}
                  onClick={() => setIsShowing(!isShowing)}
                  className={classNames(
                    open ? "ring-2 ring-blue-500 ring-offset-2" : "",
                    "flex h-[38px] cursor-pointer items-center gap-2 rounded-lg px-3 text-[14px] font-medium  outline-none",
                    hasSomeFilterSelected ? "bg-[#2563EB] text-white hover:bg-blue-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200",
                  )}>
                  <FilterSvg className={`${hasSomeFilterSelected ? "text-white" : "text-gray-400"} h-4 w-4`} />
                  <span>Filtres</span>
                </Popover.Button>

                <Transition
                  as={Fragment}
                  show={isShowing !== false}
                  enter="transition ease-out duration-200"
                  enterFrom="opacity-0 translate-y-1"
                  enterTo="opacity-100 translate-y-0"
                  leave="transition ease-in duration-150"
                  leaveFrom="opacity-100 translate-y-0"
                  leaveTo="opacity-0 translate-y-1">
                  <Popover.Panel ref={refFilter} className="absolute left-0 z-10 mt-2 w-[305px]">
                    <div className="rounded-lg shadow-lg">
                      <div className="relative grid rounded-lg border-[1px] border-gray-100 bg-white py-2">
                        {savedView.length > 0 && (
                          <ViewPopOver
                            setIsShowing={(value) => setIsShowing(value)}
                            isShowing={isShowing === "view"}
                            savedView={savedView}
                            handleSelect={handleSelectUrl}
                            handleDelete={handleDeleteFilter}
                          />
                        )}
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
                                          // @ts-expect-error
                                          selectedFilters={selectedFilters}
                                          setSelectedFilters={setSelectedFilters}
                                          setParamData={() => {}}
                                          intermediateFilter={intermediateFilter}
                                          dataFilter={dataFilter}
                                          setFilter={setFilter}
                                          key={key}
                                        />
                                      ),
                                    };
                                  }
                                  return (
                                    <FilterPopOver
                                      key={key + "-" + item.title}
                                      // @ts-expect-error
                                      filter={customItem}
                                      // @ts-expect-error
                                      selectedFilters={selectedFilters}
                                      setSelectedFilters={setSelectedFilters}
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
                  </Popover.Panel>
                </Transition>
              </>
            )}
          </Popover>
        </div>
      </div>
    </div>
  );
}
