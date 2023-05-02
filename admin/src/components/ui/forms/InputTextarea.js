import React from "react";

export default function InputTextarea({ onChange, value, disabled = false, error, readOnly = false, placeholder, rows = 2 }) {
  return (
    <div
      className={`flex min-h-[54px] w-full flex-col justify-center rounded-lg border-[1px] bg-white py-2 px-2.5 ${disabled ? "border-gray-200" : "border-gray-300"} ${
        error ? "border-red-500" : ""
      }`}>
      <textarea
        className={`w-full bg-white text-sm ${disabled ? "text-gray-400" : "text-gray-900"} placeholder:text-gray-500`}
        value={value}
        onChange={onChange}
        disabled={disabled}
        readOnly={readOnly}
        placeholder={placeholder}
        rows={rows}
      />
      {error && <div className="text-[#EF4444]">{error}</div>}
    </div>
  );
}
