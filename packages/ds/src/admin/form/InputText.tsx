import { classNames } from "@/utils";
import React from "react";
import { HiOutlineExclamation } from "react-icons/hi";

type OwnProps = {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  active?: boolean;
  readOnly?: boolean;
  error?: string;
};

export default function InputText({
  name,
  value,
  onChange,
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
        <input
          type="text"
          name={name}
          id={name}
          className="flex flex-1 h-full py-2 font-normal leading-5 text-gray-900 text-sm placeholder:text-gray-500 disabled:text-gray-500 disabled:bg-gray-50 read-only:cursor-none"
          placeholder={placeholder}
          disabled={disabled}
          value={value}
          readOnly={readOnly}
          onChange={(e) => onChange(e)}
        />
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
