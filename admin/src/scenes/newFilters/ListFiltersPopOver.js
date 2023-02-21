import { Popover, Transition } from "@headlessui/react";
import React, { Fragment } from "react";
import FilterSvg from "../../assets/icons/Filter";
import FilterPopOver from "./FilterPopOver";
import ReactTooltip from "react-tooltip";
import Field from "../../components/forms/Field";
import { ES_NO_LIMIT } from "snu-lib";
import { useHistory } from "react-router-dom";

import api from "../../services/api";
import { toastr } from "react-redux-toastr";
import ViewPopOver from "./ViewPopOver";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function ListFiltersPopOver({ pageId, filters, defaultQuery, getCount }) {
  const [search, setSearch] = React.useState("");
  // data correspond to filters
  const [data, setData] = React.useState([]);
  const [selectedFilters, setSelectedFilters] = React.useState({});
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

  const hasSomeFilterSelected = Object.values(selectedFilters).find((item) => item.filter.length > 0);

  React.useEffect(() => {
    const newFilters = search !== "" ? filters.filter((f) => f.title.toLowerCase().includes(search.toLowerCase())) : filters;
    setFiltersVisible(newFilters);
  }, [search]);

  React.useEffect(() => {
    // send count back to parent
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
    if (mounted.current) {
      getData();
      setURL();
    }
  }, [selectedFilters]);

  const init = async () => {
    const initialFilters = getURLParam();
    setSelectedFilters(initialFilters);
    const res = await buildMissions("id", initialFilters, null, 1, 25, defaultQuery, filters);
    if (!res) return;
    setData({ ...data, ...res.newFilters });
    setCount(res.count);
    mounted.current = true;
  };

  const getData = async () => {
    const res = await buildMissions("id", selectedFilters, null, 1, 25, defaultQuery, filters);
    if (!res) return;
    setData({ ...data, ...res.newFilters });
    setCount(res.count);
  };

  const getURLParam = () => {
    const filters = {};
    urlParams.forEach((value, key) => {
      filters[key] = { filter: value.split(",") };
    });
    setSelectedFilters(filters);
    return filters;
  };

  const currentFilterAsUrl = () => {
    const length = Object.keys(selectedFilters).length;
    let index = 0;
    const url = Object.keys(selectedFilters)?.reduce((acc, curr) => {
      if (selectedFilters[curr]?.filter?.length > 0) {
        acc += `${curr}=${selectedFilters[curr]?.filter.join(",")}${index < length - 1 ? "&" : ""}`;
      }
      index++;
      return acc;
    }, "");
    return url;
  };

  const setURL = () => {
    history.replace({ search: `?${currentFilterAsUrl()}` });
  };

  // text for tooltip save
  const saveTitle = Object.keys(selectedFilters).map((key) => {
    if (selectedFilters[key].filter.length > 0) {
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
    // save url params
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
    setSelectedFilters(filters);
    setIsShowing(false);
  };

  const handleFilterShowing = (value) => {
    setIsShowing(value);
    setModalSaveVisible(false);
  };
  return (
    <div>
      <Popover className="relative">
        {({ open }) => (
          <>
            <Popover.Button
              ref={ref}
              onClick={() => handleFilterShowing(!isShowing)}
              className={classNames(
                open ? "ring-2 ring-blue-500 ring-offset-2" : "",
                "flex gap-2 items-center px-3 py-2.5 rounded-lg bg-gray-100 text-[14px] font-medium text-gray-700 cursor-pointer outline-none",
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
                                data={data[item?.name] || []}
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
      <div className="mt-2 flex flex-row flex-wrap gap-2 items-center">
        {/* icon de save */}
        {hasSomeFilterSelected && <SaveDisk saveTitle={saveTitle} saveFilter={saveFilter} modalSaveVisible={modalSaveVisible} setModalSaveVisible={setModalSaveVisible} />}
        {/* Display des filtres sélectionnés */}
        {filtersVisible
          .filter((item) => selectedFilters[item.name] && selectedFilters[item.name].filter.length > 0)
          .map((filter, index) => (
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
    </div>
  );
}

const ToolTipView = ({ selectedFilters, filter }) => {
  return (
    <ReactTooltip id="tooltip-filtre" className="bg-white shadow-xl text-black !opacity-100" arrowColor="white" disable={false}>
      <div className="flex flex-row gap-2 flex-wrap max-w-[600px] rounded">
        {selectedFilters[filter.name].filter.map((item, index) => (
          <div className="bg-gray-100 rounded py-1 px-2 text-xs text-gray-500" key={item}>
            {item}
          </div>
        ))}
      </div>
    </ReactTooltip>
  );
};

const SaveDisk = ({ saveTitle, modalSaveVisible, setModalSaveVisible, saveFilter }) => {
  // handle click outside
  const ref = React.useRef();
  const [nameView, setNameView] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setModalSaveVisible(false);
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  React.useEffect(() => {
    if (nameView) return setError("");
  }, [nameView]);

  const handleSave = async () => {
    if (loading) return;
    if (!nameView) return setError("Veuillez saisir un nom pour votre vue");
    setError("");
    setLoading(true);
    const res = await saveFilter(nameView);
    if (res.ok) setNameView("");
    setLoading(false);
  };

  return (
    <>
      <ReactTooltip id="tooltip-saveFilter" className="bg-white shadow-xl text-black !opacity-100" arrowColor="white" disable={false}>
        <div>
          <div className="text-xs text-gray-600">Enregistrer cette vue...</div>
          <div className="text-gray-600 font-bold">{saveTitle.join(", ")}</div>
        </div>
      </ReactTooltip>
      <div className="relative">
        <div
          data-tip=""
          data-for="tooltip-saveFilter"
          onClick={() => setModalSaveVisible(true)}
          className="p-2 h-[42px] w-[42px] bg-gray-100 rounded flex items-center justify-center cursor-pointer">
          <FloppyDisk />
        </div>

        {modalSaveVisible && (
          <div className="absolute left-0 z-10 mt-2 bg-white w-[492px]  rounded-lg shadow-lg px-8" ref={ref}>
            <div className="font-bold text-sm text-gray-800 mt-6">Enregistrer une nouvelle (groupe de filtres)</div>
            <div className="font-medium text-xs mt-3 mb-2">Nommez la vue</div>
            <Field name="nameView" label="Nom de la vue" value={nameView} errors={{ nameView: error }} handleChange={(e) => setNameView(e.target.value)} />
            <div className="flex justify-end items-center">
              <div onClick={handleSave} className={` ${loading && "opacity-50"} bg-blue-600 text-white px-3 py-2 rounded-md w-fit my-4 self-end cursor-pointer`}>
                Enregistrer
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

const FloppyDisk = () => {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M13.9268 3.57325L10.4268 0.0732501C10.3799 0.0263627 10.3163 1.41594e-05 10.25 0H9V3.75C9 3.8163 8.97366 3.87989 8.92678 3.92678C8.87989 3.97366 8.8163 4 8.75 4H2.25C2.1837 4 2.12011 3.97366 2.07322 3.92678C2.02634 3.87989 2 3.8163 2 3.75V0H1.5C1.1023 0.000397108 0.720997 0.15856 0.439778 0.439778C0.15856 0.720997 0.000397108 1.1023 0 1.5V12.5C0.000397108 12.8977 0.15856 13.279 0.439778 13.5602C0.720997 13.8414 1.1023 13.9996 1.5 14H12.5C12.8977 13.9996 13.279 13.8414 13.5602 13.5602C13.8414 13.279 13.9996 12.8977 14 12.5V3.75C14 3.6837 13.9736 3.62012 13.9268 3.57325ZM11.25 11.5C11.25 11.5663 11.2237 11.6299 11.1768 11.6768C11.1299 11.7237 11.0663 11.75 11 11.75H2.25C2.1837 11.75 2.12011 11.7237 2.07322 11.6768C2.02634 11.6299 2 11.5663 2 11.5V8C2 7.9337 2.02634 7.87011 2.07322 7.82322C2.12011 7.77634 2.1837 7.75 2.25 7.75H11C11.0663 7.75 11.1299 7.77634 11.1768 7.82322C11.2237 7.87011 11.25 7.9337 11.25 8V11.5Z"
        fill="#6B7280"
      />
    </svg>
  );
};
const buildMissions = async (id, selectedFilters, search, page = 1, size = 25, defaultQuery = null, filterArray) => {
  let query = {};
  let aggsQuery = {};
  if (!defaultQuery) {
    query = { query: { bool: { must: [{ match_all: {} }] } } };
    aggsQuery = { query: { bool: { must: [{ match_all: {} }] } } };
  } else {
    query = structuredClone(defaultQuery.query);
    aggsQuery = structuredClone(defaultQuery.query);
  }

  let bodyQuery = {
    query: query,
    aggs: {},
    size: size,
    from: size * (page - 1),
    sort: [{ createdAt: { order: "desc" } }],
    track_total_hits: true,
  };

  let bodyAggs = {
    query: aggsQuery,
    aggs: {},
    size: 0,
    track_total_hits: true,
  };

  const getAggsFilters = (name) => {
    let aggregfiltersObject = {
      bool: {
        must: [],
      },
    };
    Object.keys(selectedFilters).map((key) => {
      if (key === name) return;
      if (selectedFilters[key].filter.length > 0) {
        let datafield = filterArray.find((f) => f.name === key).datafield;
        aggregfiltersObject.bool.must.push({ terms: { [datafield]: selectedFilters[key].filter } });
      }
    });
    return aggregfiltersObject;
  };

  //ajouter les aggregations pour count
  filterArray.map((f) => {
    bodyAggs.aggs[f.name] = {
      filter: { ...getAggsFilters(f.name) },
      aggs: {
        names: { terms: { field: filterArray.find((e) => f.name === e.name).datafield, missing: filterArray.find((e) => f.name === e.name).missingLabel, size: ES_NO_LIMIT } },
      },
    };
  });

  if (selectedFilters && Object.keys(selectedFilters).length) {
    Object.keys(selectedFilters).forEach((key) => {
      if (selectedFilters[key].customQuery) {
        // on a une custom query
        console.log("CUSTOM");
        //body.query.bool.must.push(selectedFilters[key].customQuery);
      } else if (selectedFilters[key].filter.length > 0) {
        let datafield = filterArray.find((f) => f.name === key).datafield;
        bodyQuery.query.bool.must.push({ terms: { [datafield]: selectedFilters[key].filter } });
      }
    });
  }

  /* 
  if (search) {
    body[1].query.bool.must.push({
      multi_match: { query: search, fields: ["title", "clientId", "organizationName"], type: "best_fields", operator: "or", fuzziness: 2 },
    });
  }
  */

  //maybe piquet le cal de l'api engagement pour dexu body en une req
  const resAggs = await api.esQuery("young", bodyAggs);
  if (!resAggs || !resAggs.responses || !resAggs.responses[0]) return;

  const resQuery = await api.esQuery("young", bodyQuery);
  if (!resAggs || !resAggs.responses || !resAggs.responses[0]) return;

  const aggs = resAggs.responses[0].aggregations;
  const data = resQuery.responses[0].hits.hits.map((h) => ({ ...h._source, _id: h._id }));
  const count = resQuery.responses[0].hits.total.value;
  const newFilters = {};

  // map a travers les aggregations pour recuperer les filtres

  filterArray.map((f) => {
    newFilters[f.name] = aggs[f.name].names.buckets.map((b) => ({ value: b.key, count: b.doc_count }));
  });

  return { data, count, newFilters };
};
