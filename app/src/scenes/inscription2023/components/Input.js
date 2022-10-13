import React from "react";
import ErrorMessage from "./ErrorMessage";

export default function Input({ value, placeholder = "", label, onChange, type = "text", error = "", className = "" }) {
  return (
    <div className={`mt-2 mb-6 ${className}`}>
      <label className="my-2 whitespace-nowrap">{label}</label>
      <input
        className="flex justify-between items-center gap-3 w-full bg-[#EEEEEE] px-4 py-2 border-b-[2px] border-[#3A3A3A] rounded-t-[4px]"
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      <ErrorMessage>{error}</ErrorMessage>
    </div>
  );
}
