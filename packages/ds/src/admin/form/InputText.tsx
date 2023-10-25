import React from "react";
import { HiOutlineExclamation } from "react-icons/hi";

type OwnProps = {
  disabled?: boolean;
  active?: boolean;
  error?: string;
  name: string;
  value?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}

export default function InputText({
  disabled,
  active,
  error,
  name,
  value,
  onChange,
}: OwnProps) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className={classNames(
          disabled ? "bg-gray-50" : "bg-white",
          !disabled && active ? "border-blue-500" : "border-gray-300",
          error
            ? "border-red-500 focus-within:outline-red-500"
            : "focus-within:outline-blue-500",
          "flex items-center justify-between h-[54px] w-full rounded-md border-[1px]  px-[13px] py-[9px] focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 "
        )}
      >
        <input
          type="text"
          name={name}
          id={name}
          className="flex flex-1 h-full py-2 font-normal leading-5 text-gray-900 text-sm placeholder:text-gray-500 disabled:text-gray-500 disabled:bg-gray-50"
          placeholder="Placeholder"
          disabled={disabled}
          value={value}
          onChange={(e) => onChange(e)}
        />
        {error && (
          <div className="flex items-center justify-center w-5 h-5">
            <HiOutlineExclamation className="text-red-500 w-5 h-5" />
          </div>
        )}
      </div>
      {error && <p className="text-sm leading-5 text-red-500">{error}</p>}
    </div>
  );
}
