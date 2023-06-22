import React, { Fragment, useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { BsChevronDown, BsChevronUp } from "react-icons/bs";
import { AiOutlineCheck } from "react-icons/ai";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Select({ options, selected, setSelected, label, readOnly = false, error }) {
  const [searchTerm, setSearchTerm] = useState("");
  const filteredOptions = options.filter((option) => option.label.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleOptionSelect = () => {
    setSearchTerm("");
  };

  return (
    <div>
      <Listbox value={selected} onChange={setSelected}>
        {({ open }) => (
          <>
            <div className="relative">
              <Listbox.Button className="relative w-full text-left">
                <div
                  className={`flex flex-row ${!readOnly ? "cursor-default" : "cursor-pointer"} rounded-lg border ${
                    error ? "border-red-500" : "border-gray-300"
                  } items-center bg-white py-2 px-2.5 h-[52px]`}>
                  <div className={`flex w-full flex-col `}>
                    <div className="flex w-full items-center justify-between">
                      <span className={`block truncate ${!selected ? "text-gray-400 text-[13px]" : null}`}>{selected?.label || label}</span>
                      <span className="pointer-events-none flex items-center pr-2">
                        {!readOnly && (
                          <>
                            {open ? <BsChevronUp className="h-4 w-4 text-gray-400" aria-hidden="true" /> : <BsChevronDown className="h-4 w-4 text-gray-400" aria-hidden="true" />}
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                {error ? <div className="text-[#EF4444]">{error}</div> : null}
              </Listbox.Button>

              <Transition show={!readOnly && open} as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                <Listbox.Options
                  static
                  className="max-h-60 absolute z-10 mt-1 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
                  style={{ maxHeight: "240px" }}>
                  <div className="px-2">
                    <input
                      type="text"
                      placeholder={"Rechercher..."}
                      className="w-full py-2 px-2 border border-gray-300 rounded-md mb-2"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  {filteredOptions.map((option) => (
                    <Listbox.Option
                      key={option.value}
                      className={({ active }) => classNames(active ? "bg-blue-600 text-white" : "text-gray-900", "relative cursor-default select-none list-none py-2 pl-3 pr-9")}
                      value={option}
                      onClick={() => handleOptionSelect()}>
                      {({ selected, active }) => (
                        <>
                          <span className={classNames(selected ? "font-semibold" : "font-normal", "block truncate")}>{option.label}</span>
                          {selected ? (
                            <span className={classNames(active ? "text-white" : "text-blue-600", "absolute inset-y-0 right-0 flex items-center pr-4")}>
                              <AiOutlineCheck className="h-5 w-5" aria-hidden="true" />
                            </span>
                          ) : null}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </>
        )}
      </Listbox>
    </div>
  );
}
