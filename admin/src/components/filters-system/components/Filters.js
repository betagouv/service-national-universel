import { Popover, Transition } from "@headlessui/react";
import React, { Fragment } from "react";
import FilterSvg from "../../../assets/icons/Filter";
import FilterPopOver from "./filters/FilterPopOver";

import { useHistory } from "react-router-dom";

import { toastr } from "react-redux-toastr";
import ViewPopOver from "./filters/SavedViewPopOver";

import api from "../../../services/api";
import { buildQuery, getURLParam, currentFilterAsUrl } from "./filters/utils";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Filters({ esId, pageId, filters, defaultQuery, searchBarObject = null, setData, selectedFilters, setSelectedFilters, paramData, setParamData }) {
  // search for filters
  const [search, setSearch] = React.useState("");

  // searchBar
  // data correspond to filters
  const [dataFilter, setDataFilter] = React.useState([]);
  const [filtersVisible, setFiltersVisible] = React.useState(filters);
  const [categories, setCategories] = React.useState([]);

  const [savedView, setSavedView] = React.useState([]);

  const urlParams = new URLSearchParams(window.location.search);
  const history = useHistory();

  const [isShowing, setIsShowing] = React.useState(false);
  const ref = React.useRef(null);
  const refFilter = React.useRef(null);

  const hasSomeFilterSelected = selectedFilters && Object.values(selectedFilters).find((item) => item?.filter?.length > 0 && item?.filter[0]?.trim() !== "");

  const [firstLoad, setFirstLoad] = React.useState(true);

  React.useEffect(() => {
    init();
    getDBFilters();
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

  React.useEffect(
    function updateSearchSelectedFilter() {
      // normalize search
      const normalizedSearch = search
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
      const newFilters =
        search !== ""
          ? filters.filter((f) =>
              f.title
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase()
                .includes(normalizedSearch),
            )
          : filters;
      setFiltersVisible(newFilters);
    },
    [search],
  );

  React.useEffect(
    function updateCategories() {
      if (filtersVisible.length === 0) {
        setCategories([]);
        return;
      }
      const newCategories = [];
      filtersVisible?.forEach((f) => {
        if (!newCategories.includes(f.parentGroup)) {
          newCategories.push(f.parentGroup);
        }
      });
      setCategories(newCategories);
    },
    [filtersVisible],
  );

  React.useEffect(
    function updateOnParamChange() {
      if (!selectedFilters) return;
      getData();
      setURL();
    },
    [selectedFilters, paramData.page, paramData.sort],
  );

  const init = async () => {
    // load des defaults value des filtres
    const defaultFilters = getDefaultFilters();
    const initialFilters = getURLParam(urlParams, setParamData, filters);
    setSelectedFilters({ ...defaultFilters, ...initialFilters });
  };

  const getDefaultFilters = () => {
    const newFilters = {};
    filters
      .filter((f) => f?.defaultValue)
      .map((f) => {
        if (f?.customComponent?.getQuery) {
          newFilters[f.name] = { filter: f.defaultValue, customComponentQuery: f.getQuery(f.defaultValue) };
        } else {
          newFilters[f.name] = { filter: f.defaultValue };
        }
      });
    return newFilters;
  };

  const getData = async () => {
    const res = await buildQuery(esId, selectedFilters, paramData?.page, paramData?.size, defaultQuery, filters, searchBarObject, paramData?.sort);
    if (!res) return;
    setDataFilter({ ...dataFilter, ...res.newFilters });
    const newParamData = {
      count: res.count,
      filters: { ...dataFilter, ...res.newFilters },
    };
    if (paramData.count !== res.count && !firstLoad) newParamData.page = 0;
    setParamData((paramData) => ({ ...paramData, ...newParamData }));
    setData(res.data);
    if (firstLoad) setFirstLoad(false);
  };

  const setURL = () => {
    history.replace({ search: `?${currentFilterAsUrl(selectedFilters, paramData?.page)}` });
  };

  // text for tooltip save

  const getDBFilters = async () => {
    try {
      const res = await api.get("/filters/" + pageId);
      if (!res.ok) return toastr.error("Oops, une erreur est survenue lors du chargement des filtres");
      setSavedView(res.data);
    } catch (error) {
      console.log(error);
      toastr.error("Oops, une erreur est survenue lors du chargement des filtres");
    }
  };

  const handleDeleteFilter = async (id) => {
    try {
      const res = await api.remove("/filters/" + id);
      if (!res.ok) return toastr.error("Oops, une erreur est survenue");
      toastr.success("Filtre supprimé avec succès");
      getDBFilters();
      return;
    } catch (error) {
      console.log(error);
    }
  };

  const handleSelectUrl = (url) => {
    history.push({ search: url });
    return history.go(0);
  };

  const handleFilterShowing = (value) => {
    setIsShowing(value);
  };

  return (
    <div>
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-row items-center justify-start gap-2">
          {searchBarObject && (
            <div className="h-[38px] w-[305px] border-[1px] rounded-md border-gray-300 overflow-hidden px-2.5">
              <input
                name={"searchbar"}
                placeholder={searchBarObject.placeholder}
                value={selectedFilters?.searchbar?.filter[0] || ""}
                onChange={(e) => {
                  setSelectedFilters({ ...selectedFilters, [e.target.name]: { filter: [e.target.value?.trim()] } });
                }}
                className={`w-full h-full text-xs text-gray-600`}
              />
            </div>
          )}

          <Popover className="relative">
            {({ open }) => (
              <>
                <Popover.Button
                  ref={ref}
                  onClick={() => handleFilterShowing(!isShowing)}
                  className={classNames(
                    open ? "ring-2 ring-blue-500 ring-offset-2" : "",
                    "flex gap-2 items-center px-3 h-[38px] rounded-lg bg-gray-100 text-[14px] font-medium text-gray-700 cursor-pointer outline-none",
                    hasSomeFilterSelected ? "bg-[#2563EB] text-white" : "",
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
                      <div className="relative grid bg-white py-2 rounded-lg border-[1px] border-gray-100">
                        {savedView.length > 0 && (
                          <ViewPopOver
                            setIsShowing={handleFilterShowing}
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
                          className="px-3 py-2 bg-gray-100 mx-2 rounded-lg mb-2 placeholder:text-gray-600 text-xs text-gray-900"
                          placeholder="Rechercher par..."
                        />
                        <div className="flex flex-col max-h-[590px] overflow-y-auto">
                          {categories.map((category, index) => (
                            <div key={category}>
                              {index !== 0 && <hr className="my-2 border-gray-100" />}
                              <div className="px-4 text-gray-500 text-xs leading-5 font-light">{category}</div>
                              {filtersVisible
                                ?.filter((f) => f.parentGroup === category)
                                ?.map((item) => (
                                  <FilterPopOver
                                    key={item.title}
                                    filter={item}
                                    selectedFilters={selectedFilters}
                                    setSelectedFilters={setSelectedFilters}
                                    data={dataFilter[item?.name] || []}
                                    isShowing={isShowing === item.name}
                                    setIsShowing={handleFilterShowing}
                                    setParamData={setParamData}
                                  />
                                ))}
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
