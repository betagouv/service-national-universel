import { Popover, Transition } from "@headlessui/react";
import React, { Fragment } from "react";
import FilterSvg from "../../assets/icons/Filter";
import FilterPopOver from "./FilterPopOver";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function ListFiltersPopOver({ filters, data, selectedFilters, setSelectedFilters }) {
  const [search, setSearch] = React.useState("");
  const [filtersVisible, setFiltersVisible] = React.useState(filters);
  const [categories, setCategories] = React.useState([]);

  const [isShowing, setIsShowing] = React.useState("");
  const ref = React.useRef(null);
  const refFilter = React.useRef(null);

  React.useEffect(() => {
    const newFilters = search !== "" ? filters.filter((f) => f.title.toLowerCase().includes(search.toLowerCase())) : filters;
    setFiltersVisible(newFilters);
  }, [search]);

  React.useEffect(() => {
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

  return (
    <div>
      <Popover className="relative">
        {({ open }) => (
          <>
            <Popover.Button
              ref={ref}
              onClick={() => setIsShowing(!isShowing)}
              className={classNames(
                open ? "ring-2 ring-blue-500 ring-offset-2" : "",
                "flex gap-2 items-center px-3 py-2.5 rounded-lg bg-gray-100 text-[14px] font-medium text-gray-700 cursor-pointer outline-none",
              )}>
              <FilterSvg className="text-gray-400 h-4 w-4" />
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
                <div className="rounded-lg shadow-lg ">
                  <div className="relative grid bg-white py-2 rounded-lg border-[1px] border-gray-100">
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
                                setIsShowing={setIsShowing}
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
        {Object.values(selectedFilters).find((item) => item.filter.length > 0) && <div>J'ai un item</div>}
        {/* Display des filtres sélectionnés */}
        {filtersVisible
          .filter((item) => selectedFilters[item.name] && selectedFilters[item.name].filter.length > 0)
          .map((filter, index) => (
            <div
              key={filter.title}
              onClick={() => setIsShowing(filter.name)}
              className=" cursor-pointer flex flex-row border-[1px] border-gray-200 rounded-md w-fit p-2 items-center gap-1">
              <div className="text-gray-700 font-medium text-xs">{filter.title} :</div>
              {selectedFilters[filter.name].filter.map((item, index) => {
                if (index > 2) {
                  if (index === selectedFilters[filter.name].filter.length - 1) {
                    return (
                      <div className="bg-gray-100 rounded py-1 px-2 text-xs text-gray-500" key={item}>
                        +{index - 2}
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

// const filterArray = [
//   { title: "Cohorte", name: "cohort", datafield: "cohort.keyword", parentGroup: "Général" },
//   { title: "Région", name: "region", datafield: "cohort.keyword", parentGroup: "Général" },
//   { title: "Département", name: "department", datafield: "cohort.keyword", parentGroup: "Général" },
//   { title: "Classe", name: "grade", datafield: "cohort.keyword", parentGroup: "Dossier" },
// ];

// {
//     Géneral : [
//         { title: "Cohorte", name: "cohort", datafield: "cohort.keyword", parentGroup: "Général" },
//         { title: "Région", name: "region", datafield: "cohort.keyword", parentGroup: "Général" },
//         { title: "Département", name: "department", datafield: "cohort.keyword", parentGroup: "Général" },
//     ],
//     Dossier : [
//         { title: "Classe", name: "grade", datafield: "cohort.keyword", parentGroup: "Dossier" },
//     ]
// }
