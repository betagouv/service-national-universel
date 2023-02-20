import { Popover, Transition } from "@headlessui/react";
import React, { Fragment } from "react";
import FilterSvg from "../../assets/icons/Filter";
import FilterPopOver from "./FilterPopOver";
import ReactTooltip from "react-tooltip";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function ListFiltersPopOver({ filters, data, selectedFilters, setSelectedFilters }) {
  const [search, setSearch] = React.useState("");
  const [filtersVisible, setFiltersVisible] = React.useState(filters);
  const [categories, setCategories] = React.useState([]);

  const [isShowing, setIsShowing] = React.useState(false);
  const ref = React.useRef(null);
  const refFilter = React.useRef(null);

  const hasSomeFilterSelected = Object.values(selectedFilters).find((item) => item.filter.length > 0);

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

  const saveTitle = Object.keys(selectedFilters).map((key) => {
    if (selectedFilters[key].filter.length > 0) {
      return filters.find((f) => f.name === key)?.title + " (" + selectedFilters[key].filter.length + ")";
    }
  });
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
        {hasSomeFilterSelected && (
          <>
            <ReactTooltip id="tooltip-saveFilter" className="bg-white shadow-xl text-black !opacity-100" arrowColor="white" disable={false}>
              <div>
                <div className="text-xs text-gray-600">Enregistrer cette vue...</div>
                <div className="text-gray-600 font-bold">{saveTitle.join(", ")}</div>
              </div>
            </ReactTooltip>
            <div data-tip="" data-for="tooltip-saveFilter" className="p-2 h-[42px] w-[42px] bg-gray-100 rounded flex items-center justify-center cursor-pointer">
              <FloppyDisk />
            </div>
          </>
        )}
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
                      <div key={item}>
                        <ReactTooltip id="tooltip-filtre" className="bg-white shadow-xl text-black !opacity-100" arrowColor="white" disable={false}>
                          <div className="flex flex-row gap-2 flex-wrap max-w-[600px] rounded">
                            {selectedFilters[filter.name].filter.map((item, index) => (
                              <div className="bg-gray-100 rounded py-1 px-2 text-xs text-gray-500" key={item}>
                                {item}
                              </div>
                            ))}
                          </div>
                        </ReactTooltip>
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
