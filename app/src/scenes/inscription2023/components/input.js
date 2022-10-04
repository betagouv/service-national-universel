import React from "react";

export default function Input({ className, value, placeholder = "", label, onChange, type = "text" }) {
  return (
    <div className={className}>
      <label className="my-2">{label}</label>
      <input
        className="flex justify-between items-center gap-3 w-full bg-[#EEEEEE] px-4 py-2 border-b-[2px] border-[#3A3A3A] rounded-t-[4px]"
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
