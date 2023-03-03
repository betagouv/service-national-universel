import { Popover, Transition } from "@headlessui/react";
import React, { Fragment, useEffect } from "react";
import FilterSvg from "../../../assets/icons/Filter";
import FilterPopOver from "./FilterPopOver";

import { SaveDisk } from "./Save";
import { useHistory } from "react-router-dom";

import { toastr } from "react-redux-toastr";
import ViewPopOver from "./ViewPopOver";

import api from "../../../services/api";
import { buildMissions, getURLParam, currentFilterAsUrl } from "./utils";
import ReactTooltip from "react-tooltip";

import { SortOptionComponent } from "./SortOptionComponent";
import { getCustomComponent } from "../customFilter";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function ListFiltersPopOver({
  esId,
  pageId,
  filters,
  defaultQuery,
  getCount,
  searchBarObject = null,
  setData,
  page = 1,
  size = 25,
  setPage,
  selectedFilters,
  setSelectedFilters,
  sortOptions = null,
}) {
  // search for filters
  const [search, setSearch] = React.useState("");

  // searchBar
  // data correspond to filters
  const [dataFilter, setDataFilter] = React.useState([]);
  const [filtersVisible, setFiltersVisible] = React.useState(filters);
  const [categories, setCategories] = React.useState([]);
  const mounted = React.useRef(false);
  const [modalSaveVisible, setModalSaveVisible] = React.useState(false);

  const [savedView, setSavedView] = React.useState([]);

  const [count, setCount] = React.useState(0);

  const urlParams = new URLSearchParams(window.location.search);
  const history = useHistory();

  const [isShowing, setIsShowing] = React.useState(false);
  const ref = React.useRef(null);
  const refFilter = React.useRef(null);

  const hasSomeFilterSelected = Object.values(selectedFilters).find((item) => item?.filter?.length > 0 && item?.filter[0]?.trim() !== "");

  const [sortSelected, setSortSelected] = React.useState(sortOptions ? sortOptions[0] : null);

  React.useEffect(() => {
    const newFilters = search !== "" ? filters.filter((f) => f.title.toLowerCase().includes(search.toLowerCase())) : filters;
    setFiltersVisible(newFilters);
  }, [search]);

  React.useEffect(() => {
    // send count back to parent on every count updates
    getCount(count);
  }, [count]);

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

  React.useEffect(() => {
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
  }, [filtersVisible]);

  React.useEffect(() => {
    getData();
    setURL();
  }, [selectedFilters, page, sortSelected]);

  const init = async () => {
    const initialFilters = getURLParam(urlParams, setPage, filters);
    setSelectedFilters(initialFilters);
    const res = await buildMissions(esId, initialFilters, page, size, defaultQuery, filters, searchBarObject);
    if (!res) return;
    setDataFilter({ ...dataFilter, ...res.newFilters });
    setData(res.data);
    setCount(res.count);
    mounted.current = true;
  };

  const getData = async () => {
    console.log("getData", selectedFilters);
    const res = await buildMissions(esId, selectedFilters, page, size, defaultQuery, filters, searchBarObject, sortSelected);
    if (!res) return;
    setDataFilter({ ...dataFilter, ...res.newFilters });
    setCount(res.count);
    if (count !== res.count) setPage(0);
    setData(res.data);
  };

  const setURL = () => {
    history.replace({ search: `?${currentFilterAsUrl(selectedFilters, page)}` });
  };

  // text for tooltip save
  const saveTitle = Object.keys(selectedFilters).map((key) => {
    if (key === "searchbar") {
      if (selectedFilters[key]?.filter?.length > 0 && selectedFilters[key]?.filter[0]?.trim() !== "") return selectedFilters[key]?.filter[0];
      return;
    }
    if (selectedFilters[key]?.filter?.length > 0) {
      return filters.find((f) => f.name === key)?.title + " (" + selectedFilters[key].filter.length + ")";
    }
  });

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

  const saveFilter = async (name) => {
    try {
      const res = await api.post("/filters", {
        page: pageId,
        url: currentFilterAsUrl(),
        name: name,
      });
      if (!res.ok) return toastr.error("Oops, une erreur est survenue");
      toastr.success("Filtre sauvegardé avec succès");
      getDBFilters();
      setModalSaveVisible(false);
      return res;
    } catch (error) {
      console.log("???", error);
      if (error.code === "ALREADY_EXISTS") return toastr.error("Oops, le filtre existe déjà");
      return error;
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
    history.replace({ search: url });
    const urlParams = new URLSearchParams(window.location.search);
    const filters = {};
    urlParams.forEach((value, key) => {
      filters[key] = { filter: value.split(",") };
    });
    console.log("filters", filters);
    setSelectedFilters(filters);
    setIsShowing(false);
  };

  const handleFilterShowing = (value) => {
    setIsShowing(value);
    setModalSaveVisible(false);
  };

  const handleCustomComponent = (query, f) => {
    console.log("handleCustomComponent? in listeFiltersPopover", query, f);
    setSelectedFilters({ ...selectedFilters, [f?.name]: { filter: query.value, customComponentQuery: query } });
  };

  return (
    <div>
      {/* TRICK DE FOU FURIEUX POUR RENDER LES CUSTOM COMPONENTS AU LOADING ET EXECUTER LA QUERY*/}
      {selectedFilters &&
        filters
          .filter((f) => f.customComponent)
          .map((f) => {
            return (
              <div className="hidden" key={f.name}>
                {getCustomComponent(f.customComponent, (value) => handleCustomComponent(value, f), selectedFilters[f?.name])}
              </div>
            );
          })}
      <div className="flex flex-row items-center justify-start gap-2">
        {searchBarObject && (
          <div className="h-[38px] w-[305px] border-[1px] rounded-md border-gray-300 overflow-hidden px-2.5">
            <input
              name={"searchbar"}
              placeholder={searchBarObject.placeholder}
              value={selectedFilters?.searchbar?.filter[0] || ""}
              onChange={(e) => setSelectedFilters({ ...selectedFilters, [e.target.name]: { filter: [e.target.value?.trim()] } })}
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
                        className="px-3 py-2 bg-gray-100 mx-2 rounded-lg mb-2 placeholder:text-gray-600 text-sm text-gray-900"
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
      <div className="mt-2 flex flex-row flex-wrap gap-2 items-center">
        {/* icon de save */}
        {hasSomeFilterSelected && <SaveDisk saveTitle={saveTitle} saveFilter={saveFilter} modalSaveVisible={modalSaveVisible} setModalSaveVisible={setModalSaveVisible} />}
        {/* Display des filtres sélectionnés */}
        {filtersVisible
          .filter((item) => selectedFilters[item.name] && selectedFilters[item.name].filter.length > 0)
          .map((filter) => (
            <div
              key={filter.title}
              onClick={() => handleFilterShowing(filter.name)}
              className=" cursor-pointer flex flex-row border-[1px] border-gray-200 rounded-md w-fit p-2 items-center gap-1">
              <div className="text-gray-700 font-medium text-xs">{filter.title} :</div>
              {selectedFilters[filter.name].filter.map((item, index) => {
                if (index > 2) {
                  if (index === selectedFilters[filter.name].filter.length - 1) {
                    return (
                      <div key={item}>
                        <ToolTipView selectedFilters={selectedFilters} filter={filter} />
                        <div data-tip="" data-for="tooltip-filtre" className="bg-gray-100 rounded py-1 px-2 text-xs text-gray-500">
                          +{index - 2}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }
                return (
                  <div className="bg-gray-100 rounded py-1 px-2 text-xs text-gray-500" key={item}>
                    {item}
                  </div>
                );
              })}
            </div>
          ))}
      </div>
      {sortOptions && <SortOptionComponent sortOptions={sortOptions} sortSelected={sortSelected} setSortSelected={setSortSelected} />}
    </div>
  );
}

const ToolTipView = ({ selectedFilters, filter }) => {
  return (
    <ReactTooltip id="tooltip-filtre" className="bg-white shadow-xl text-black !opacity-100" arrowColor="white" disable={false}>
      <div className="flex flex-row gap-2 flex-wrap max-w-[600px] rounded">
        {selectedFilters[filter.name].filter.map((item) => (
          <div className="bg-gray-100 rounded py-1 px-2 text-xs text-gray-500" key={item}>
            {item}
          </div>
        ))}
      </div>
    </ReactTooltip>
  );
};
