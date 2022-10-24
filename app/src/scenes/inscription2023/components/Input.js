import React from "react";
import ErrorMessage from "./ErrorMessage";
import CorrectionMessage from "./CorrectionMessage";

export default function Input({ value, placeholder = "", label, onChange, type = "text", error = "", className = "", correction = "" }) {
  return (
    <div className={`my-2 ${className}`}>
      <label className={`my-2 whitespace-nowrap ${correction ? "text-[#CE0500]" : "text-[#3A3A3A]"}`}>{label}</label>
      <input
        className={`flex justify-between items-center gap-3 w-full bg-[#EEEEEE] px-4 py-2 border-b-[2px] ${correction ? "border-[#CE0500]" : "border-[#3A3A3A]"} rounded-t-[4px]`}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      <ErrorMessage>{error}</ErrorMessage>
      <CorrectionMessage>{correction}</CorrectionMessage>
    </div>
  );
}
