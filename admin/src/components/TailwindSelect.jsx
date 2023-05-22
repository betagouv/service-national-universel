import React, { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { BsChevronDown, BsChevronUp } from "react-icons/bs";
import { AiOutlineCheck } from "react-icons/ai";
import InfoCircle from "../assets/icons/InfoCircle";
import ReactTooltip from "react-tooltip";
import { getRandomId } from "../utils";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Select({ options, selected, setSelected, label = "", readOnly = false, icon, error, classname = "", hint = "" }) {
  const tooltipId = getRandomId();

  return (
    <div>
      <Listbox value={selected} onChange={setSelected}>
        {({ open }) => (
          <>
            <div className="relative">
              <Listbox.Button className={`relative w-full text-left` + classname}>
                <div
                  className={`flex flex-row ${!readOnly ? "cursor-default" : "cursor-pointer"} rounded-lg border ${
                    error ? "border-red-500" : "border-gray-300"
                  } items-center bg-white py-2 px-2.5`}>
                  {icon ? <span className="pr-[12px]">{icon}</span> : null}
                  <div className={`flex w-full flex-row items-center justify-center `}>
                    <div className="flex w-full flex-col justify-center">
                      <div className="text-xs text-gray-500">{label}</div>
                      <div className="">{options.find((e) => e.value === selected)?.label}</div>
                    </div>
                    <span className="pointer-events-none flex items-center pr-2">
                      {!readOnly && (
                        <>{open ? <BsChevronUp className="h-4 w-4 text-gray-400" aria-hidden="true" /> : <BsChevronDown className="h-4 w-4 text-gray-400" aria-hidden="true" />}</>
                      )}
                    </span>
                  </div>
                </div>
                {error ? <div className="text-[#EF4444]">{error}</div> : null}
              </Listbox.Button>

              <Transition show={!readOnly && open} as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                <Listbox.Options className="max-h-60 absolute z-10 mt-1 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  {options.map((option) => (
                    <Listbox.Option
                      key={option.value}
                      className={({ active }) => classNames(active ? "bg-blue-600 text-white" : "text-gray-900", "relative cursor-default select-none list-none py-2 pl-3 pr-9")}
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
              {hint && (
                <>
                  <span data-tip data-for={tooltipId} className="absolute top-2 right-2">
                    <InfoCircle height={16} width={16} color="#9ca3af" />
                  </span>
                  <ReactTooltip id={tooltipId} type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md" tooltipRadius="6">
                    <p className=" w-[275px] list-outside !px-2 !py-1.5 text-left text-xs text-gray-600">{hint}</p>
                  </ReactTooltip>
                </>
              )}
            </div>
          </>
        )}
      </Listbox>
    </div>
  );
}
