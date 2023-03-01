import React from "react";

export default function Input({ value, placeholder = null, onChange, disabled = false }) {
  return (
    <input
      disabled={disabled}
      className="flex justify-between items-center gap-3 w-full bg-[#EEEEEE] px-4 py-2 border-b-[2px] border-[#3A3A3A] rounded-t-[4px]"
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
