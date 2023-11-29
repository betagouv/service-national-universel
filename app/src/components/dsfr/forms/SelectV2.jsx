import React from "react";
import ErrorMessage from "./ErrorMessage";

export default function Select({ label, options, value, placeholder = "Sélectionner une option", onChange, error = "", correction = "", disabled = false, name = "" }) {
  return (
    <div className="my-4">
      <label className={`w-full ${disabled && "text-[#929292]"}`}>
        {label}
        <select
          name={name}
          disabled={disabled}
          className="w-full border-b-2 rounded-t bg-[#EEEEEE] disabled:text-[#929292] border-gray-800 disabled:border-[#EEEEEE] mt-2 px-4 py-2 appearance-none"
          value={value}
          onChange={(e) => onChange(e.target.value.value)}>
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
