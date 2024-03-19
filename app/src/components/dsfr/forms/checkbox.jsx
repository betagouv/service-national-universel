import React from "react";
import { RiCheckLine } from "react-icons/ri";

export default function CheckBox({ checked, onChange, label = "", description = "", className = "", disabled = false }) {
  return (
    <div
      onClick={() => {
        if (disabled) return;
        if (checked) onChange(false);
        else onChange(true);
      }}
      className={`flex items-center ${className}`}>
      <div
        className={`flex shrink-0 items-center justify-center border-[1px] border-[#000091] rounded-sm h-6 w-6 ${
          disabled ? "border-[#929292]" : `cursor-pointer  ${checked ? "bg-[#000091]" : "bg-inherit"}`
        }`}>
        {checked ? <RiCheckLine className="text-white" /> : null}
      </div>
      <span className={`pl-3 ${!disabled && "cursor-pointer"}`}>
        {label} <span className="text-[#666666] text-sm leading-tight"> {description}</span>
      </span>
    </div>
  );
}
