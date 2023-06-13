import { Popover, Transition } from "@headlessui/react";
import dayjs from "dayjs";
import React, { Fragment } from "react";
import DateIcon from "../../../assets/icons/DateIcon";
import DatePicker from "../../../components/ui/forms/DatePicker";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function DatePickerWrapper({ label, value, onChange, disabled = false, error, mode, placeholder = "Date", readOnly = false }) {
  return (
    <Popover className="relative w-full">
      {({ open }) => (
        <>
          <Popover.Button
            disabled={disabled || readOnly}
            className={classNames(
              open ? "ring-2 ring-blue-500 ring-offset-2" : "",
              disabled && "cursor-not-allowed",
              readOnly && "cursor-default",
              "w-full cursor-pointer rounded-lg outline-none ",
            )}>
            <div
              className={`flex w-full items-center justify-between rounded-lg border-[1px] bg-white py-2 px-2.5 ${disabled ? "border-gray-200" : "border-gray-300"} ${
                error ? "border-red-500" : ""
              }`}>
              <div className="flex flex-1 flex-col">
                <p className={`text-left text-xs leading-4 ${disabled ? "text-gray-400" : "text-gray-500"} `}>{label}</p>
                <div className="flex items-center gap-2">
                  <input
                    className={`w-full bg-white text-sm ${disabled ? "text-gray-400" : "text-gray-900"}`}
                    disabled={true}
                    value={value ? dayjs(value).format("DD/MM/YYYY") : ""}
                    placeholder={placeholder}
                  />
                </div>
                {error && <div className="text-[#EF4444]">{error}</div>}
              </div>
              <DateIcon className={`mr-1 flex ${disabled ? "text-gray-400" : "text-gray-500"}`} />
            </div>
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
            <Popover.Panel className="absolute left-0 z-10 pt-2">
              <div className="flex flex-auto rounded-3xl bg-white shadow-lg ring-1 ring-gray-900/5 ">
                <DatePicker mode={mode} fromYear={2022} toYear={2030} value={value} onChange={onChange} />
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
}
