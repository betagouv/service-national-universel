import React from "react";
import { RiCheckboxBlankCircleLine, RiRadioButtonLine } from "react-icons/ri";

export default function EnhancedRadioButton({ label, description, picto, checked, onChange, disabled, className = "" }) {
  return (
    <button
      onClick={onChange}
      disabled={disabled}
      className={`border-[1px] w-full flex items-center py-1 hover:bg-gray-50 active:bg-gray-100 hover:border-blue-france-sun-113 disabled:text-gray-400 disabled:hover:border-gray-200 disabled:hover:bg-white ${
        checked && !disabled ? "border-blue-france-sun-113" : "border-gray-200"
      } ${className}`}>
      <div className={`m-3 text-lg ${disabled ? "text-gray-400" : "text-blue-france-sun-113"}`}>{checked ? <RiRadioButtonLine /> : <RiCheckboxBlankCircleLine />}</div>
      <div className="text-left">
        <p>{label}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <div className={`ml-auto flex justify-center items-center border-l h-20 w-24 ${disabled && "saturate-0 opacity-60"}`}>{picto}</div>
    </button>
  );
}
