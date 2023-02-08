import { Listbox, Transition } from "@headlessui/react";
import React, { Fragment, useState } from "react";
import { AiOutlineCheck } from "react-icons/ai";
import { BsChevronDown, BsChevronUp } from "react-icons/bs";

export default function MultiSelect({ options, selected, onChange, label }) {
  const [query, setQuery] = useState("");
  const filteredOptions = options.filter((option) => option.label.toLowerCase().includes(query.toLowerCase()));

  function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
  }

  return (
    <div className="min-w-96">
      <Listbox value={selected} onChange={onChange} multiple>
        {({ open }) => (
          <div className="relative">
            <Listbox.Button className="flex rounded-lg p-2 border bg-white items-center gap-3">
              <p className="min-w-1/4 text-left text-sm text-gray-500 max-w-xs whitespace-nowrap overflow-hidden">
                {label} :{" "}
                {options
                  .filter((option) => selected.includes(option.value))
                  .map((option) => option.label)
                  .join(", ")}
              </p>
              <span className="pointer-events-none flex items-center pr-2">
                {open ? <BsChevronUp className="h-4 w-4 text-gray-400" aria-hidden="true" /> : <BsChevronDown className="h-4 w-4 text-gray-400" aria-hidden="true" />}
              </span>
            </Listbox.Button>

            <Transition show={open} as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
              <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                <input onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher..." className="w-full py-2 px-3 border-b text-xs" />
                {filteredOptions.map((option) => (
                  <Listbox.Option
                    key={option.value}
                    className={({ active }) => classNames(active ? "text-white bg-blue-600" : "text-gray-900", "relative cursor-default select-none py-2 pl-3 pr-9 list-none")}
                    value={option.value}>
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
        )}
      </Listbox>
    </div>
  );
}
