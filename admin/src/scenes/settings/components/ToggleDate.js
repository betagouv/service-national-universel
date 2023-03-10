import React, { Fragment } from "react";
import Toggle from "../../../components/Toggle";
import DateIcon from "../../../assets/icons/DateIcon";
import { Popover, Transition } from "@headlessui/react";
import DatePicker from "../../../components/ui/forms/DatePicker";
import dayjs from "dayjs";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function ToggleDate({ value, onChange, range, onChangeRange, disabled = false, label, readOnly = false }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg bg-gray-100 px-3 py-2">
      <div className="flex items-center justify-between">
        <p className="text-gray-800 text-sm  text-left">{label}</p>
        <Toggle disabled={disabled || readOnly} value={value} onChange={onChange} />
      </div>
      <div className="flex items-center justify-between">
        <p className="text-gray-500 text-xs text-left">
          Début : <strong>{range?.from ? dayjs(range?.from).locale("fr").format("DD/MM/YYYY") : ""}</strong>
        </p>
        <p className="text-gray-500 text-xs text-left">
          Fin : <strong>{range?.to ? dayjs(range?.to).locale("fr").format("DD/MM/YYYY") : ""}</strong>
        </p>
        <Popover className="relative">
          {({ open }) => (
            <>
              <Popover.Button
                className={classNames(disabled && "cursor-not-allowed", readOnly && "cursor-default", "cursor-pointer outline-none flex items-center")}
                disabled={disabled || readOnly}>
                <DateIcon className={classNames(open ? "text-blue-600" : "text-gray-500")} />
              </Popover.Button>
              <Transition
                as={Fragment}
                show={open}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 translate-y-1"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-1">
                <Popover.Panel className="absolute z-10 pt-2 right-0 transform translate-x-[15px] mt-2">
                  <div className="flex-auto rounded-3xl bg-white shadow-lg ring-1 ring-gray-900/5 flex ">
                    <DatePicker mode="range" fromYear={2022} toYear={2030} value={range} onChange={onChangeRange} />
                  </div>
                </Popover.Panel>
              </Transition>
            </>
          )}
        </Popover>
      </div>
    </div>
  );
}
