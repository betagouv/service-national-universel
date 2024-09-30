import { Popover, Transition } from "@headlessui/react";
import dayjs from "@/utils/dayjs.utils";
import React, { Fragment, useEffect, useState } from "react";
import DateIcon from "../../../../assets/icons/DateIcon";
import DatePicker from "../DatePicker";
import { BsChevronDown, BsChevronUp } from "react-icons/bs";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

interface DatePickerWrapperProps {
  label: string;
  value: Date | null;
  onChange: (date: Date) => void;
  disabled?: boolean;
  error?: string;
  mode?: "single" | "range";
  isTime?: boolean;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
}
export default function DatePickerWrapper({ label, value, onChange, disabled = false, error, mode, isTime, placeholder, readOnly = false, className }: DatePickerWrapperProps) {
  const [time, setTime] = useState(value ? `${String(dayjs(value).utc().hour()).padStart(2, "0")}:${String(dayjs(value).utc().minute()).padStart(2, "0")}` : "00:00");

  useEffect(() => {
    handleChange(value);
  }, [time]);

  const handleChange = (date) => {
    if (!date) return undefined;
    if (!isTime || mode !== "single") return onChange(date);

    // eslint-disable-next-line
    let [hours, minutes] = time ? time.split(":") : value ? [dayjs(value).hour(), dayjs(value).minute()] : ["00", "00"];

    hours = Number(hours);
    minutes = Number(minutes);
    const seconds = hours === 23 && minutes === 59 ? 59 : 0;

    const d = dayjs(date).utc().hour(Number(hours)).minute(Number(minutes)).second(seconds).millisecond(0).toDate();
    onChange(d);
  };

  const getHoursOrMinutes = (type) => {
    const [hours, minutes] = time.split(":");
    if (type === "hours") return Number(hours);
    return Number(minutes);
  };

  const setHoursOrMinutes = (type, n) => {
    if (type === "hours") setTime(`${String(n).padStart(2, "0")}:${String(getHoursOrMinutes("minutes")).padStart(2, "0")}`);
    else setTime(`${String(getHoursOrMinutes("hours")).padStart(2, "0")}:${String(n).padStart(2, "0")}`);
  };

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
              className={`flex w-full items-center justify-between rounded-lg border-[1px] bg-white py-2 px-2.5 ${className} ${disabled ? "border-gray-200" : "border-gray-300"} ${
                error ? "border-red-500" : ""
              }`}>
              <div className="flex flex-1 flex-col">
                <p className={`text-left text-xs leading-4 ${disabled ? "text-gray-400" : "text-gray-500"} `}>{label}</p>
                <div className="flex items-center gap-2">
                  <input
                    className={`w-full bg-white text-sm ${disabled ? "text-gray-400" : "text-gray-900"}`}
                    disabled={true}
                    value={
                      value
                        ? // @ts-expect-error toUtcLocally
                          dayjs(value).toUtcLocally().format("DD/MM/YYYY") +
                          // @ts-expect-error shiftTimeToUtc
                          (isTime ? " " + dayjs().hour(dayjs(value).utc().hour()).minute(dayjs(value).utc().minute()).shiftTimeToUtc().format("HH:mm") : "")
                        : ""
                    }
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
              <div className="flex items-stretch flex-auto rounded-3xl bg-white shadow-lg ring-1 ring-gray-900/5 overflow-hidden">
                <DatePicker mode={mode} fromYear={new Date().getFullYear() - 70} toYear={new Date().getFullYear() + 10} value={value || new Date()} onChange={handleChange} />
                {isTime && (
                  <div className="flex items-center justify-between my-[16px] px-6 border-l-[1px] border-gray-200">
                    <div className="flex items-start h-full">
                      {["hours", "minutes"].map((c, colIndex) => (
                        <div key={c + colIndex} className="flex items-center h-full">
                          <div className="flex flex-col items-center justify-between h-full">
                            <div
                              className="flex items-center justify-center w-[40px] h-[40px] rounded-full cursor-pointer hover:bg-[#eff6ff]"
                              onClick={() => {
                                const hOrM = getHoursOrMinutes(c);
                                // eslint-disable-next-line
                                setHoursOrMinutes(c, c === "hours" ? (hOrM === 0 ? 23 : hOrM - 1) : hOrM === 0 ? 59 : hOrM - 1);
                              }}>
                              <BsChevronUp size={24} color="#797b86" />
                            </div>
                            {/* 42 * 5 =  */}
                            <div className="max-h-[210px] overflow-hidden">
                              {/* @ts-expect-error --tw-translate-y */}
                              <div className={`-translate-y-[0px]`} style={{ "--tw-translate-y": `-${42 * (getHoursOrMinutes(c) ?? 0)}px` }}>
                                {[
                                  "",
                                  "",
                                  ...Array(c === "hours" ? 24 : 60)
                                    .fill(0)
                                    .map((n, i) => n + i),
                                  "",
                                  "",
                                ].map((n, i) => (
                                  <div
                                    key={c + n + i}
                                    className={`flex items-center justify-center w-[40px] h-[40px] text-[14px] my-[2px] rounded-[8px] ${
                                      typeof n === "number" && "cursor-pointer hover:bg-[#eff6ff]"
                                    } ${n === getHoursOrMinutes(c) && "font-bold text-white !bg-[#2563eb]"}`}
                                    onClick={() => !!n && setHoursOrMinutes(c, n)}>
                                    {n}
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div
                              className="flex items-center justify-center w-[40px] h-[40px] rounded-full cursor-pointer hover:bg-[#eff6ff]"
                              onClick={() => {
                                const hOrM = getHoursOrMinutes(c);
                                // eslint-disable-next-line
                                setHoursOrMinutes(c, c === "hours" ? (hOrM === 23 ? 0 : hOrM + 1) : hOrM === 59 ? 0 : hOrM + 1);
                              }}>
                              <BsChevronDown size={24} color="#797b86" />
                            </div>
                          </div>
                          {c === "hours" ? <div className="font-bold mx-[4px] text-[15px] leading-[24px]">:</div> : null}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
}
