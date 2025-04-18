import { classNames } from "../../utils";
import React from "react";

import { ErrorIcon, ErrorMessage, getFormBaseClass } from "./InputBase";

type OwnProps = {
  name: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  className?: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  active?: boolean;
  readOnly?: boolean;
  error?: string;
  max?: number;
  high?: number;
  icon?: React.ReactNode;
};

export default function InputText({
  name,
  value,
  onChange,
  type = "text",
  className,
  label,
  placeholder,
  disabled,
  active,
  readOnly,
  error,
  max,
  high = 54,
  icon,
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

  return (
    <div className={"flex flex-col gap-2 " + className}>
      <div
        className={classNames(
          baseClass,
          focusActive,
          bgColorClass,
          borderColorClass,
          `px-[13px] py-[9px] h-[${high}px]`,
        )}
      >
        <div className="flex flex-1 flex-col justify-center">
          {label && (
            <label
              htmlFor={name}
              className={classNames(
                error ? "text-red-500" : "text-gray-500",
                "m-0  text-xs font-normal leading-4",
              )}
            >
              {label}
            </label>
          )}
          <div className="flex items-center gap-2">
            {icon}
            <input
              type={type}
              name={name}
              id={name}
              className={getInputClass({ label })}
              placeholder={placeholder}
              disabled={disabled}
              value={value}
              readOnly={readOnly}
              onChange={(e) => onChange?.(e)}
              maxLength={max}
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
    "font-normal leading-5 text-gray-900 text-sm placeholder:text-gray-500 disabled:text-gray-500 disabled:bg-gray-50 disabled:cursor-default read-only:cursor-default w-full";
  if (label) {
    return classNames(baseClass, "");
  } else {
    return classNames(baseClass, "h-full py-2");
  }
};
