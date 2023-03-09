import React from "react";

export default function InputText({ onChange, value, label, disabled = false, error, readOnly = false, placeholder }) {
  return (
    <div
      className={`flex flex-col border-[1px] min-h-[54px] justify-center w-full py-2 px-2.5 rounded-lg bg-white ${disabled ? "border-gray-200" : "border-gray-300"} ${
        error ? "border-red-500" : ""
      }`}>
      {label && <p className={`text-xs leading-4 ${disabled ? "text-gray-400" : "text-gray-500"} `}>{label}</p>}
      <div className="flex items-center gap-2">
        <input
          className={`w-full text-sm bg-white ${disabled ? "text-gray-400" : "text-gray-900"} placeholder:text-gray-500`}
          value={value}
          onChange={onChange}
          disabled={disabled}
          readOnly={readOnly}
          placeholder={placeholder}
          type="text"
        />
      </div>
      {error && <div className="text-[#EF4444]">{error}</div>}
    </div>
  );
}
