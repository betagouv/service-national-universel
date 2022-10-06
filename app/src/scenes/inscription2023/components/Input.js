import React from "react";

export default function Input({ value, placeholder = "", label, onChange, type = "text", error = "" }) {
  return (
    <div className="my-2">
      <label className="my-2">{label}</label>
      <input
        className="flex justify-between items-center gap-3 w-full bg-[#EEEEEE] px-4 py-2 border-b-[2px] border-[#3A3A3A] rounded-t-[4px]"
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      <div className="h-4 text-[#CE0500] text-sm">{error}</div>
    </div>
  );
}
