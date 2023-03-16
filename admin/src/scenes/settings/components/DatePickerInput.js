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
              "outline-none rounded-lg w-full cursor-pointer ",
            )}>
            <div
              className={`flex items-center justify-between border-[1px] w-full py-2 px-2.5 rounded-lg bg-white ${disabled ? "border-gray-200" : "border-gray-300"} ${
                error ? "border-red-500" : ""
              }`}>
              <div className="flex flex-col flex-1">
                <p className={`text-xs text-left leading-4 ${disabled ? "text-gray-400" : "text-gray-500"} `}>{label}</p>
                <div className="flex items-center gap-2">
                  <input
                    className={`w-full text-sm bg-white ${disabled ? "text-gray-400" : "text-gray-900"}`}
                    disabled={true}
                    value={value ? dayjs(value).locale("fr").format("DD/MM/YYYY") : ""}
                    placeholder={placeholder}
                  />
                </div>
                {error && <div className="text-[#EF4444]">{error}</div>}
              </div>
              <DateIcon className={`flex mr-1 ${disabled ? "text-gray-400" : "text-gray-500"}`} />
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
            <Popover.Panel className="absolute z-10 pt-2 left-0">
              <div className="flex-auto rounded-3xl bg-white shadow-lg ring-1 ring-gray-900/5 flex ">
                <DatePicker mode={mode} fromYear={2022} toYear={2030} value={value} onChange={onChange} />
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
}
