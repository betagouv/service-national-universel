import React, { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { BsChevronDown, BsChevronUp } from "react-icons/bs";
import { AiOutlineCheck } from "react-icons/ai";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Select({ options, selected, setSelected, label, readOnly = false, icon, error }) {
  const border = (open) => {
    if (readOnly) return "border-gray-200";
    if (error) return "border-red-500";
    if (open) return "border-blue-500";
    return "border-gray-300";
  };

  return (
    <Listbox value={selected} onChange={setSelected}>
      {({ open }) => (
        <>
          <div className="relative">
            <Listbox.Button className="relative w-full text-left">
              <div className={` ${readOnly ? "cursor-default" : "cursor-pointer"} ${border(open)} bg-white py-2 px-2.5 items-center space-y-0 gap-0 flex rounded-lg border-[1px]`}>
                {icon && icon}
                <div className="w-full flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">{label}</p>
                    <p className="block truncate h-5">{selected?.label}</p>
                  </div>
                  <div className="pointer-events-none flex items-center pr-2">
                    {!readOnly && open && <BsChevronUp className="h-4 w-4 text-gray-900" aria-hidden="true" />}
                    {!readOnly && !open && <BsChevronDown className="h-4 w-4 text-gray-900" aria-hidden="true" />}
                  </div>
                </div>
              </div>
              {error && <div className="text-[#EF4444]">{error}</div>}
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
                        {selected && (
                          <span className={classNames(active ? "text-white" : "text-blue-600", "absolute inset-y-0 right-0 flex items-center pr-4")}>
                            <AiOutlineCheck className="h-5 w-5" aria-hidden="true" />
                          </span>
                        )}
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
  );
}
