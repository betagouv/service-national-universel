import { Popover, Transition } from "@headlessui/react";
import React, { Fragment } from "react";
import { BsChevronRight } from "react-icons/bs";
import Trash from "../../../../assets/icons/Trash";
import { normalizeString } from "./utils";

// file used to show the popover for the all the possible values of a filter

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function FilterPopOver({ filter, data, selectedFilters, setSelectedFilters, isShowing, setIsShowing, setParamData }) {
  return (
    <Popover>
      <Popover.Button
        onClick={() => setIsShowing(filter.name)}
        className={classNames(
          isShowing ? "bg-gray-100 font-bold" : "",
          "flex w-full cursor-pointer items-center justify-between rounded-lg py-2 px-4 outline-none transition duration-150 ease-in-out hover:bg-gray-50",
        )}>
        <p className="text-sm leading-5 text-gray-700 text-left">{filter.title}</p>
        <div className="flex items-center gap-2">
          {selectedFilters[filter?.name]?.filter?.length > 0 && (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-normal text-blue-600">
              {selectedFilters[filter?.name]?.filter?.length}
            </div>
          )}
          <BsChevronRight className="text-gray-400" />
        </div>
      </Popover.Button>
      <DropDown isShowing={isShowing} filter={filter} selectedFilters={selectedFilters} setSelectedFilters={setSelectedFilters} data={data} setParamData={setParamData} />
    </Popover>
  );
}

export const DropDown = ({ isShowing, filter, selectedFilters, setSelectedFilters, data, inListFilter = true, setParamData }) => {
  const [search, setSearch] = React.useState("");
  const [optionsVisible, setOptionsVisible] = React.useState(data || []);
  const ref = React.useRef(null);

  React.useEffect(() => {
    let temp = data;
    if (filter?.filter) {
      temp.filter(filter.filter);
    }
    if (filter?.sort) {
      filter.sort(temp);
    }

    const naIndex = data.findIndex((item) => item.key === "N/A");
    const emptyIndex = data.findIndex((item) => item.key === "");

    // Concatenate the arrays if both 'N/A' and '' are found
    if (naIndex !== -1 && emptyIndex !== -1) {
      data[naIndex].doc_count += data[emptyIndex].doc_count;
      data.splice(emptyIndex, 1);
    } else {
      if (emptyIndex !== -1) {
        data[emptyIndex].key = "N/A";
      }
    }

    setOptionsVisible(temp);
  }, [data]);

  React.useEffect(() => {
    // normalize search
    const normalizedSearch = normalizeString(search);
    let newData =
      search !== ""
        ? data.filter((f) => (filter?.translate ? normalizeString(filter.translate(f.key)).includes(normalizedSearch) : normalizeString(f.key).includes(normalizedSearch)))
        : data;
    if (filter?.filter) {
      newData = newData.filter(filter.filter);
    }
    setOptionsVisible(newData);
  }, [search]);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setParamData((oldvalue) => {
          return { ...oldvalue, isShowing: "else" };
        });
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  const handleSelect = (value) => {
    // check si c'est un isSingle (un seul filtre possible)
    if (filter?.isSingle) return setSelectedFilters({ ...selectedFilters, [filter?.name]: { filter: [value] } });
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

  const handleCustomComponent = (value) => {
    setSelectedFilters({ ...selectedFilters, [filter?.name]: { filter: value } });
  };

  return (
    <Transition
      as={Fragment}
      show={isShowing}
      enter="transition ease-out duration-200"
      enterFrom="opacity-0 translate-y-1"
      enterTo="opacity-100 translate-y-0"
      leave="transition ease-in duration-150"
      leaveFrom="opacity-100 translate-y-0"
      leaveTo="opacity-0 translate-y-1">
      <Popover.Panel className={`absolute left-[101%] z-20 w-[305px] ${inListFilter ? "-translate-y-[36px]" : "translate-y-[4px]"}`}>
        <div ref={ref} className="rounded-lg shadow-lg ">
          <div className="relative grid rounded-lg border-[1px] border-gray-100 bg-white py-2">
            <div className="mb-1 flex items-center justify-between py-2 px-3">
              <p className="text-xs font-light leading-5 text-gray-500">{filter?.title}</p>
              {filter.allowEmpty === false ? <></> : <Trash className="h-3 w-3 cursor-pointer font-light text-red-500" onClick={handleDelete} />}
            </div>
            {filter?.customComponent ? (
              filter.customComponent(handleCustomComponent, selectedFilters[filter?.name]?.filter)
            ) : (
              <>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="mx-3 mb-2 truncate rounded-lg bg-gray-100 px-3 py-2 text-xs text-gray-900 placeholder:text-gray-600"
                  placeholder={`Rechercher un(e) ${filter?.title.toLowerCase()}...`}
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
                          a.key.toString().localeCompare(b.key.toString());
                        })

                        ?.map((option) => {
                          const optionSelected = selectedFilters[filter?.name] && selectedFilters[filter?.name].filter?.includes(option?.key);
                          const showCount = filter?.showCount === false ? false : true;

                          return (
                            <div className="flex cursor-pointer items-center justify-between py-2 px-3 hover:bg-gray-50" key={option.key} onClick={() => handleSelect(option.key)}>
                              <div className="flex items-center gap-2 text-sm leading-5 text-gray-700">
                                {/* Avoid react alert by using onChange even if empty */}
                                <input type="checkbox" checked={optionSelected} onChange={() => {}} />
                                <div className={`${optionSelected && "font-bold"}`}>
                                  {option.key === "N/A" ? filter.missingLabel : filter?.translate ? filter.translate(option?.key) : option?.key}
                                </div>
                              </div>
                              {showCount && <div className="text-xs leading-5 text-gray-500">{option.doc_count}</div>}
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

//
