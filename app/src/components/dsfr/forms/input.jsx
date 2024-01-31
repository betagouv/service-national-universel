import React from "react";

export default function Input({ value, placeholder = null, onChange, disabled = false, type = "text", name = null, autocomplete = "off", onBlur = () => {} }) {
  return (
    <input
      disabled={disabled}
      className="flex w-full items-center justify-between gap-3 rounded-t-[4px] border-b-[2px] border-[#3A3A3A] bg-[#EEEEEE] px-4 py-2 mt-2"
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      name={name}
      id={name}
      autoComplete={autocomplete}
      onBlur={onBlur}
    />
  );
}
