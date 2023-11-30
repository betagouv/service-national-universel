import React from "react";
import ErrorMessage from "./ErrorMessage";
import { RiArrowDownSLine } from "react-icons/ri";

export default function Select({ label, options, value, placeholder = "Sélectionner une option", onChange, error = "", correction = "", disabled = false, name = "" }) {
  return (
    <div className="my-4">
      <label className={`w-full ${disabled && "text-[#929292]"}`}>
        <div className="relative">
          {label}
          <RiArrowDownSLine className="absolute right-2 top-11" />
        </div>
        <select
          name={name}
          disabled={disabled}
          className="focus:ring-2 w-full border-b-2 rounded-t bg-[#EEEEEE] disabled:text-[#929292] border-gray-800 disabled:border-[#EEEEEE] mt-2 px-4 py-2 mr-4 appearance-none"
          value={value}
          onChange={(e) => onChange(e.target.value)}>
          <option value="">{placeholder}</option>
          {options.map((option, index) => (
            <option key={option?.key || index} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <ErrorMessage>{error}</ErrorMessage>
      <ErrorMessage>{correction}</ErrorMessage>
    </div>
  );
}
