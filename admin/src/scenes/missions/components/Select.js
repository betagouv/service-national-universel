import React, { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { BsChevronDown, BsChevronUp } from "react-icons/bs";
import { AiOutlineCheck } from "react-icons/ai";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Select({ options, selected, setSelected, label, readOnly = false, icon }) {
  return (
    <div className="w-full">
      <Listbox value={selected} onChange={setSelected} style={{ fontFamily: "Marianne" }}>
        {({ open }) => (
          <>
            <div className="relative">
              <Listbox.Button className="relative w-full text-left">
                <div className={`flex flex-row ${!readOnly ? "cursor-default" : "cursor-pointer"} rounded-lg border border-gray-300 bg-white py-2 px-2.5 items-center`}>
                  {icon ? icon : null}
                  <div className={`flex flex-col w-full `}>
                    {label && <label className="text-xs leading-4 text-gray-500">{label}</label>}
                    <div className="flex items-center justify-between w-full">
                      <span className="block truncate text-sm">{selected?.label}</span>
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
              </Listbox.Button>

              <Transition show={!readOnly && open} as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  {options.map((option) => (
                    <Listbox.Option
                      key={option.value}
                      className={({ active }) => classNames(active ? "text-white bg-blue-600" : "text-gray-900", "relative cursor-default select-none py-2 pl-3 pr-9 list-none")}
                      value={option}>
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
