import React, { Fragment } from "react";
import Toggle from "../../../Toggle";
import DateIcon from "../../../../assets/icons/DateIcon";
import { Popover, Transition } from "@headlessui/react";
import DatePicker from "../DatePicker";
import dayjs from "@/utils/dayjs.utils";
import { MdInfoOutline } from "react-icons/md";
import ReactTooltip from "react-tooltip";

function classNames(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

interface ToggleDateProps {
  value: boolean;
  onChange: (value: boolean) => void;
  range: { from: Date | string | null; to: Date | null };
  onChangeRange: (range: { from: Date | null; to: Date | null }) => void;
  disabled?: boolean;
  label?: string;
  readOnly?: boolean;
  tooltipText?: React.ReactNode;
  className?: string;
}

function ToggleDate({ value, onChange, range, onChangeRange, disabled = false, label, readOnly = false, tooltipText, className = "bg-gray-100" }: ToggleDateProps) {
  return (
    <div className={`flex flex-col gap-2 rounded-lg ${className} px-3 py-2`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-left text-sm text-gray-800">{label}</p>
          {tooltipText && (
            <>
              <MdInfoOutline data-tip data-for="affectation_manuelle" className="h-4 w-4 cursor-pointer text-gray-400" />
              <ReactTooltip id="affectation_manuelle" type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md">
                <div className="w-[275px] list-outside !px-2 !py-1.5 text-left text-xs text-gray-600">{tooltipText}</div>
              </ReactTooltip>
            </>
          )}
        </div>
        <Toggle disabled={disabled || readOnly} value={value} onChange={onChange} />
      </div>
      <div className="flex items-center justify-between">
        <p className="text-left text-xs text-gray-500">
          Début : <strong>{value && range?.from ? dayjs(range?.from).format("DD/MM/YYYY") : ""}</strong>
        </p>
        <p className="text-left text-xs text-gray-500">
          Fin : <strong>{value && range?.to ? dayjs(range?.to).format("DD/MM/YYYY") : ""}</strong>
        </p>
        <Popover className="relative">
          {({ open }) => (
            <>
              <Popover.Button
                className={classNames(disabled && "cursor-not-allowed", readOnly && "cursor-default", "flex cursor-pointer items-center outline-none")}
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
                <Popover.Panel className="absolute right-0 z-10 mt-2 translate-x-[15px] transform pt-2">
                  <div className="flex flex-auto rounded-3xl bg-white shadow-lg ring-1 ring-gray-900/5 ">
                    <DatePicker mode="range" fromYear={2022} toYear={2030} value={range} disabled={disabled} onChange={onChangeRange} />
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

export default ToggleDate;
