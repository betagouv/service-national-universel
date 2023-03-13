import { Popover, Transition } from "@headlessui/react";
import React, { Fragment } from "react";
import { BsChevronRight } from "react-icons/bs";
import Trash from "../../../../assets/icons/Trash";

// file used to show the popover for the all the possible values of a filter

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function FilterPopOver({ filter, data, selectedFilters, setSelectedFilters, isShowing, setIsShowing }) {
  const [search, setSearch] = React.useState("");
  const [optionsVisible, setOptionsVisible] = React.useState(data || []);

  React.useEffect(() => {
    setOptionsVisible(data);
  }, [data]);

  React.useEffect(() => {
    const newData = search !== "" ? data.filter((f) => f.key.toLowerCase().includes(search.toLowerCase())) : data;
    setOptionsVisible(newData);
  }, [search]);

  const handleSelect = (value) => {
    let newFilters = [];
    // store localement les filtres
    if (selectedFilters[filter?.name]) {
      if (selectedFilters[filter?.name]?.filter?.includes(value)) {
        newFilters = selectedFilters[filter?.name]?.filter?.filter((f) => f !== value);
      } else {
        newFilters = selectedFilters[filter?.name]?.filter?.concat(value);
      }
    } else {
      newFilters = [value];
    }
    setSelectedFilters({ ...selectedFilters, [filter?.name]: { filter: newFilters } });
  };

  const handleDelete = () => {
    setSelectedFilters({ ...selectedFilters, [filter?.name]: { filter: [] } });
  };

  const handleCustomComponent = (query) => {
    setSelectedFilters({ ...selectedFilters, [filter?.name]: { filter: query.value, customComponentQuery: query } });
  };

  return (
    <Popover className="">
      {({ open }) => (
        <>
          <Popover.Button
            onClick={() => setIsShowing(filter.name)}
            className={classNames(
              open ? "bg-gray-100 font-bold" : "",
              "flex items-center justify-between transition rounded-lg duration-150 ease-in-out hover:bg-gray-50 cursor-pointer py-2 px-4 outline-none w-full",
            )}>
            <p className="text-gray-700 text-sm leading-5">{filter.title}</p>
            <div className="flex items-center gap-2">
              {selectedFilters[filter?.name]?.filter?.length > 0 && (
                <div className="flex items-center justify-center text-blue-600 bg-indigo-100 rounded-full font-normal w-6 h-6 text-xs">
                  {selectedFilters[filter?.name]?.filter?.length}
                </div>
              )}
              <BsChevronRight className="text-gray-400" />
            </div>
          </Popover.Button>

          <Transition
            as={Fragment}
            show={isShowing}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1">
            <Popover.Panel className="absolute left-[101%] z-20 w-[305px] -translate-y-[36px]">
              <div className="rounded-lg shadow-lg ">
                <div className="relative grid bg-white py-2 rounded-lg border-[1px] border-gray-100">
                  <div className="flex items-center justify-between py-2 mb-1 px-3">
                    <p className="text-gray-500 text-xs leading-5 font-light">{filter?.parentGroup}</p>
                    <Trash className="text-red-500 h-3 w-3 font-light cursor-pointer" onClick={handleDelete} />
                  </div>
                  {filter?.customComponent ? (
                    filter.customComponent(handleCustomComponent, selectedFilters[filter?.name]?.filter)
                  ) : (
                    <>
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="mx-3 px-3 py-2 bg-gray-100 rounded-lg mb-2 placeholder:text-gray-600 text-xs text-gray-900 truncate"
                        placeholder={`Rechercher un(e) ${filter?.title.toLowerCase()}...`}
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
                                <div
                                  className="flex items-center justify-between hover:bg-gray-50 py-2 px-3 cursor-pointer"
                                  key={option?.key}
                                  onClick={() => handleSelect(option?.key)}>
                                  <div className="flex items-center gap-2 text-gray-700 text-sm leading-5">
                                    <input type="checkbox" checked={selectedFilters[filter?.name] && selectedFilters[filter?.name].filter?.includes(option?.key)} />
                                    {option.key === "N/A" ? filter.missingLabel : filter?.translate ? filter.translate(option?.key) : option?.key}
                                  </div>
                                  <div className="text-gray-500 text-xs leading-5">{option.doc_count}</div>
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
        </>
      )}
    </Popover>
  );
}

//
