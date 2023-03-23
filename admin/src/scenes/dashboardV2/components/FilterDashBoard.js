import React, { Fragment } from "react";

import ReactTooltip from "react-tooltip";
import FilterSvg from "../../../assets/icons/Filter";
import { Popover, Transition } from "@headlessui/react";
import Trash from "../../../assets/icons/Trash";

export const FilterDashBoard = ({ selectedFilters, setSelectedFilters, filterArray }) => {
  return (
    <div className="bg-white w-full py-4 flex flex-row justify-between px-4 rounded-lg border-[1px] border-gray-200">
      <div className="flex flex-row gap-2 items-center justify-center self-start h-[50px]">
        <FilterSvg className="text-gray-300 h-4 w-4" />
        <div className="font-bold text-gray-900 text-lg">Filtrer</div>
      </div>
      <div className="flex flex-row gap-2 items-center justify-end flex-wrap w-7/10">
        {filterArray.map((filter) => (
          <FilterComponent key={filter.id} filter={filter} selectedFilters={selectedFilters} setSelectedFilters={setSelectedFilters} />
        ))}
      </div>
    </div>
  );
};

export const FilterComponent = ({ filter, selectedFilters, setSelectedFilters }) => {
  const selectedFilterValues = selectedFilters[filter.id]?.length ? selectedFilters[filter.id] : [];
  const [visible, setVisible] = React.useState(false);

  return (
    <div className="relative">
      <div className={`p-0.5 border-[2px] ${visible ? "border-blue-600 rounded-xl" : "border-transparent"}`}>
        <div onClick={() => setVisible(true)} className="cursor-pointer flex flex-row border-[1px] border-gray-200 rounded-md w-fit p-2 items-center gap-1">
          <div className="text-gray-700 font-medium text-xs">{filter.name}</div>
          {selectedFilterValues?.length === filter.options?.length ? (
            <div className="bg-gray-100 rounded py-1 px-2 text-xs text-gray-500">{filter?.fullValue}</div>
          ) : selectedFilterValues.length > 0 ? (
            selectedFilterValues.map((item, index) => {
              const label = filter.options.find((option) => option.key === item).label;
              if (index > 2) {
                if (index === selectedFilterValues.length - 1) {
                  return (
                    <div key={item}>
                      <ToolTipView selectedFilterValues={selectedFilterValues} filter={filter} />
                      <div data-tip="" data-for={"tooltip-filtre" + filter.id} className="bg-gray-100 rounded py-1 px-2 text-xs text-gray-500">
                        +{index - 2}
                      </div>
                    </div>
                  );
                }
                return null;
              }
              return (
                <div className="bg-gray-100 rounded py-1 px-2 text-xs text-gray-500" key={item}>
                  {label}
                </div>
              );
            })
          ) : (
            <div className="bg-gray-100 rounded py-1 px-2 text-xs text-gray-500">{filter?.fullValue ? filter.fullValue : "Choisir"}</div>
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
    <ReactTooltip id={"tooltip-filtre" + filter.id} className="bg-white shadow-xl text-black !opacity-100" arrowColor="white" disable={false}>
      <div className="flex flex-row gap-2 flex-wrap max-w-[600px] rounded">
        {selectedFilterValues.map((item) => {
          const label = filter.options.find((option) => option.key === item).label;
          return (
            <div className="bg-gray-100 rounded py-1 px-2 text-xs text-gray-500" key={item}>
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
    setOptionsVisible(data);
  }, [data]);

  React.useEffect(() => {
    // normalize search
    const normalizedSearch = search
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
    const newData =
      search !== ""
        ? data.filter((f) =>
            f.key
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .toLowerCase()
              .includes(normalizedSearch),
          )
        : data;
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
    let newFilters = [];
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
    setSelectedFilters({ ...selectedFilters, [filter?.id]: newFilters });
  };
  const handleDelete = () => {
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
      <Popover.Panel className={`absolute right-0 z-20 w-[305px] translate-y-[4px]`}>
        <div ref={ref} className="rounded-lg shadow-lg ">
          <div className="relative grid bg-white py-2 rounded-lg border-[1px] border-gray-100">
            {filter?.customComponent ? (
              filter.customComponent(handleSelect, selectedFilters[filter?.id])
            ) : (
              <>
                <div className="flex items-center justify-between py-2 mb-1 px-3">
                  <p className="text-gray-500 text-xs leading-5 font-light">{filter.name}</p>
                  {filter.allowEmpty === false ? <></> : <Trash className="text-red-500 h-3 w-3 font-light cursor-pointer" onClick={handleDelete} />}
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="mx-3 px-3 py-2 bg-gray-100 rounded-lg mb-2 placeholder:text-gray-600 text-xs text-gray-900 truncate"
                  placeholder={`Rechercher un(e) ${filter?.name.toLowerCase()}...`}
                />
                <div className="flex flex-col max-h-[400px] overflow-y-auto">
                  {optionsVisible?.length === 0 ? (
                    <div className="flex items-center justify-center py-2 px-3">
                      <p className="text-gray-500 text-xs leading-5">Aucun résultat</p>
                    </div>
                  ) : (
                    <>
                      {optionsVisible
                        ?.sort((a, b) => {
                          a.key.toString().localeCompare(b.key.toString());
                        })
                        ?.map((option) => (
                          <div className="flex items-center justify-between hover:bg-gray-50 py-2 px-3 cursor-pointer" key={option?.key} onClick={() => handleSelect(option?.key)}>
                            <div className="flex items-center gap-2 text-gray-700 text-sm leading-5">
                              <input type="checkbox" checked={selectedFilters[filter.id]?.length && selectedFilters[filter?.id]?.includes(option?.key)} />
                              {option.label}
                            </div>
                          </div>
                        ))}
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
