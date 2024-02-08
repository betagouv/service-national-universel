import React from "react";
import { HiOutlineChevronDown } from "react-icons/hi";

import { classNames } from "../../utils";
import { PHONE_ZONES } from "../../common";
import { ErrorIcon, ErrorMessage, getFormBaseClass } from "./InputBase";

type OwnProps = {
  name: string;
  value: string;
  onChange: (e: string) => void;
  onChangeZone: (e: string) => void;
  zoneValue?: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  active?: boolean;
  readOnly?: boolean;
  error?: string;
};

export default function InputPhone({
  name,
  value,
  onChange,
  onChangeZone,
  zoneValue,
  label,
  placeholder,
  disabled,
  active,
  readOnly,
  error,
}: OwnProps) {
  const {
    baseClass,
    focusActive,
    bgColorClass,
    borderColorClass,
    isErrorActive,
  } = getFormBaseClass({
    disabled,
    active,
    readOnly,
    error,
  });

  const selectRef = React.useRef<HTMLSelectElement>(null);

  const handleChangePhoneZone = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    onChangeZone(event.target.value);
  };

  const handleChangeValue = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <div className="flex flex-col gap-2">
      <div
        className={classNames(
          baseClass,
          focusActive,
          bgColorClass,
          borderColorClass,
          "px-[13px] py-[9px] h-[54px]"
        )}
      >
        <div className="flex flex-1 flex-col justify-center">
          {label && (
            <label
              htmlFor={name}
              className={classNames(
                error ? "text-red-500" : "text-gray-500",
                "m-0  text-xs font-normal leading-4"
              )}
            >
              {label}
            </label>
          )}
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                disabled={disabled || readOnly}
                className="appearance-none w-20 text-sm !text-gray-500 font-normal bg-transparent leading-5 :disabled:text-gray-500 disabled:opacity-100"
                ref={selectRef}
                onChange={handleChangePhoneZone}
                value={zoneValue}
              >
                {!zoneValue && (
                  <option value="" className="flex gap-1">
                    + ?? ...
                  </option>
                )}
                {Object.entries(PHONE_ZONES).map(([key, phoneZone]) => (
                  <option key={key} value={key}>
                    {phoneZone.code} {phoneZone.shortcut}
                  </option>
                ))}
              </select>
              <div className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 pointer-events-none">
                <HiOutlineChevronDown className="text-gray-500 w-5 h-5 leading-5" />
              </div>
            </div>
            <div className="h-5 w-[1px] bg-gray-200" />
            <input
              type="text"
              name={name}
              id={name}
              className={getInputClass({ label })}
              placeholder={placeholder ? placeholder : "Choisissez une zone"}
              disabled={disabled}
              value={value}
              readOnly={readOnly}
              onChange={handleChangeValue}
            />
          </div>
        </div>
        {isErrorActive && <ErrorIcon />}
      </div>
      {isErrorActive && <ErrorMessage error={error} />}
    </div>
  );
}

const getInputClass = ({ label }: { label?: string }) => {
  const baseClass =
    "flex flex-1 font-normal leading-5 text-gray-900 text-sm placeholder:text-gray-500 disabled:text-gray-500 disabled:bg-gray-50 disabled:cursor-default read-only:cursor-default";
  if (label) {
    return classNames(baseClass, "");
  } else {
    return classNames(baseClass, "h-full py-2");
  }
};
