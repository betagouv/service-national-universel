import React from "react";
import { classNames } from "../../utils";
import { ErrorIcon, ErrorMessage, getFormBaseClass } from "./InputBase";

type OwnProps = {
  name: string;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  active?: boolean;
  readOnly?: boolean;
  error?: string;
};

export default function InputNumber({
  name,
  value,
  onChange,
  className,
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

  return (
    <div className={"flex flex-col gap-2 " + className}>
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
          <input
            type="number"
            name={name}
            id={name}
            className={getInputClass({ label })}
            placeholder={placeholder}
            disabled={disabled}
            value={value}
            readOnly={readOnly}
            onChange={(e) => onChange(e)}
          />
        </div>
        {isErrorActive && <ErrorIcon />}
      </div>
      {isErrorActive && <ErrorMessage error={error} />}
    </div>
  );
}

const getInputClass = ({ label }: { label?: string }) => {
  const baseClass =
    "font-normal leading-5 text-gray-900 text-sm placeholder:text-gray-500 disabled:text-gray-500 disabled:bg-gray-50 disabled:cursor-default read-only:cursor-default";
  if (label) {
    return classNames(baseClass, "");
  } else {
    return classNames(baseClass, "h-full py-2");
  }
};
