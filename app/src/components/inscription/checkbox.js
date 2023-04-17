import React from "react";
import Check from "../../assets/icons/Check";

export default function CheckBox({ checked, onChange, label = "", description = "", className = "", disabled = false }) {
  return (
    <div
      onClick={() => {
        if (disabled) return;
        if (checked) onChange(false);
        else onChange(true);
      }}
      className={`flex items-center ${className}`}
    >
      <div
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-[1px] ${
          disabled ? "bg-[#929292]" : `cursor-pointer hover:scale-105  ${checked ? "bg-[#000091]" : "bg-inherit"}`
        }`}
      >
        {checked ? <Check className="text-white" /> : null}
      </div>
      {label && (
        <label className={`pl-2 ${disabled && "cursor-pointer"}`}>
          {label} <span className="text-[14px] leading-tight text-[#666666]"> {description}</span>
        </label>
      )}
    </div>
  );
}
