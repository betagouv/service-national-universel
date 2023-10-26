import { classNames } from "@/utils";
import React from "react";
import { HiOutlineExclamation } from "react-icons/hi";

type OwnProps = {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  placeholder?: string;
  disabled?: boolean;
  active?: boolean;
  readOnly?: boolean;
  error?: string;
};

export default function InputTextLabel({
  name,
  value,
  onChange,
  label,
  placeholder,
  disabled,
  active,
  readOnly,
  error,
}: OwnProps) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className={classNames(
          readOnly || disabled
            ? "cursor-none outline-none"
            : "cursor-text focus-within:outline focus-within:outline-blue-500",
          disabled ? "bg-gray-50" : "bg-white",
          !readOnly && !disabled && active
            ? "border-blue-500"
            : "border-gray-300",
          error && !readOnly && !disabled ? "border-red-500" : "",
          "flex items-center justify-between h-[54px] w-full rounded-md border-[1px]  px-[13px] py-[9px] focus-within:outline-2 focus-within:outline-offset-2"
        )}
      >
        <div className="flex flex-1 flex-col justify-center">
          <label
            htmlFor={name}
            className="m-0 text-gray-500 text-xs font-normal leading-4"
          >
            {label}
          </label>
          <input
            type="text"
            name={name}
            id={name}
            className="text-gray-900 text-sm leading-5 placeholder:text-gray-500 disabled:text-gray-500 disabled:bg-gray-50 read-only:cursor-none"
            placeholder={placeholder}
            disabled={disabled}
            value={value}
            readOnly={readOnly}
            onChange={(e) => onChange(e)}
          />
        </div>
        {error && !readOnly && !disabled && (
          <div className="flex items-center justify-center w-5 h-5">
            <HiOutlineExclamation className="text-red-500 w-5 h-5" />
          </div>
        )}
      </div>
      {error && !readOnly && !disabled && (
        <p className="text-sm leading-5 text-red-500">{error}</p>
      )}
    </div>
  );
}
