import React from "react";
import { HiOutlineExclamation } from "react-icons/hi";

export const getFormBaseClass = ({
  disabled,
  active,
  readOnly,
  error,
}: {
  disabled?: boolean;
  active?: boolean;
  readOnly?: boolean;
  error?: string;
}) => {
  const isErrorActive = error && !readOnly && !disabled;
  const isActive = !readOnly && !disabled && active;

  const baseClass =
    "flex items-center justify-between w-full rounded-md border-[1px] focus-within:outline-2 focus-within:outline-offset-2";
  const focusActive =
    readOnly || disabled
      ? "outline-none cursor-default"
      : "cursor-text focus-within:outline focus-within:outline-blue-500";
  const bgColorClass = disabled ? "bg-gray-50" : "bg-white";
  const borderColorClass = isErrorActive
    ? "border-red-500"
    : isActive
    ? "border-blue-500"
    : "border-gray-300";

  return {
    baseClass,
    focusActive,
    bgColorClass,
    borderColorClass,
    isErrorActive,
  };
};

export function ErrorMessage({ error }: { error?: string }) {
  return <p className="text-sm leading-5 text-red-500">{error}</p>;
}

export function ErrorIcon() {
  return (
    <div className="flex items-center justify-center w-5 h-5">
      <HiOutlineExclamation className="text-red-500 w-5 h-5" />
    </div>
  );
}
