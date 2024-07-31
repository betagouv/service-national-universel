import React, { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { BsChevronDown, BsChevronUp } from "react-icons/bs";
import { AiOutlineCheck } from "react-icons/ai";
import Archive from "../../../assets/icons/Archive";
import None from "../../../assets/icons/None";
import Pencil from "../../../assets/icons/Pencil";
import XCircleFull from "../../../assets/icons/XCircleFull";
import CheckCircleFull from "../../../assets/icons/CheckCircleFull";
import Clock from "../../../assets/icons/Clock";
import { MISSION_STATUS, translate } from "snu-lib";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

function design(statusToColors, selected, type) {
  return statusToColors[selected.value][type];
}

export default function Select({ options, selected, setSelected, label, readOnly = false, icon }) {
  const optionsSelect = Object.keys(MISSION_STATUS).map((status) => {
    return { label: translate(status), value: status };
  });
  const statusToColors = GetColor(optionsSelect);

  return (
    <div className="w-full">
      <Listbox value={selected} onChange={setSelected} style={{ fontFamily: "Marianne" }}>
        {({ open }) => (
          <>
            <div className="relative">
              <Listbox.Button className="relative w-full text-left">
                <div
                  className={`flex flex-row ${!readOnly ? "cursor-default" : "cursor-pointer"} items-center rounded-lg border py-2 px-2.5 ${design(
                    statusToColors,
                    selected,
                    "style",
                  )}`}>
                  {design(statusToColors, selected, "icon")}
                  <div className={`flex w-full flex-col `}>
                    {label && <label className="text-xs leading-4 text-gray-500">{label}</label>}
                    <div className="flex w-full items-center justify-between">
                      <span className="block truncate pl-2.5">{selected?.label}</span>
                      <span className="pointer-events-none flex items-center pr-2">
                        {!readOnly && (
                          <>
                            {open ? (
                              <BsChevronUp className={`h-4 w-4 ${design(statusToColors, selected, "arrowColor")}`} aria-hidden="true" />
                            ) : (
                              <BsChevronDown className={`h-5 w-5 font-bold ${design(statusToColors, selected, "arrowColor")}`} aria-hidden="true" />
                            )}
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
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
            </div>
          </>
        )}
      </Listbox>
    </div>
  );
}

function GetColor(options) {
  const optionsValue = options.map((item) => item.value);
  optionsValue.sort();
  const bgcolor = ["bg-indigo-50", "bg-violet-50", "bg-sky-500", "bg-red-50", "bg-emerald-50", "bg-yellow-500", "bg-orange-400"];
  const color = ["text-indigo-500", "text-violet-600", "text-white", "text-red-600", "text-emerald-600", "text-white", "text-white"];
  const border = ["border-gray-200", "border-gray-200", "border-sky-500", "border-gray-200", "border-gray-200", "border-yellow-500", "border-orange-400"];
  const icons = [
    <Archive key="archive" />,
    <None key="none" />,
    <Pencil key="pencil" width="16" height="16" />,
    <XCircleFull key="x-circle" />,
    <CheckCircleFull key="check-circle" />,
    <Clock key="clock1" />,
    <Clock key="clock2" />,
  ];
  const arrow = ["text-gray-500", "text-gray-500", "text-white", "text-gray-500", "text-gray-500", "text-white", "text-white"];
  const text = ["text-sm", "text-sm", "text-sm", "text-sm", "text-sm", "text-xs", "text-xs"];

  const statusToColors = {};

  for (let i = 0; i < optionsValue.length; i++) {
    statusToColors[optionsValue[i]] = {
      style: bgcolor[i] + " " + color[i] + " " + border[i] + " " + text[i] + " ",
      icon: icons[i],
      arrowColor: arrow[i],
    };
  }
  return statusToColors;
}
