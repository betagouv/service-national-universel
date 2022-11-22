import React from "react";

export default function Field({ onChange, value, label, disabled = false, error }) {
  return (
    <div className={`flex flex-col border-[1px] border-gray-300 w-full py-2 px-2.5 rounded-lg ${disabled ? "bg-gray-100" : ""} ${error ? "border-red-500" : ""}`}>
      <label className="text-xs leading-4 text-gray-500">{label}</label>
      <input className={`w-full ${disabled ? "bg-gray-100" : ""}`} value={value} onChange={onChange} disabled={disabled} />
      {error && <div className="text-[#EF4444]">{error}</div>}
    </div>
  );
}
