import React from "react";
import Check from "../../assets/icons/Check";

export default function CheckBox({ checked, onChange, label = "", description = "", className = "" }) {
  return (
    <div
      onClick={() => {
        if (checked) onChange(false);
        else onChange(true);
      }}
      className={`flex items-center ${className}`}>
      <div className={`flex shrink-0 items-center justify-center border-[1px] rounded-lg h-6 w-6 cursor-pointer hover:scale-105 ${checked ? "bg-[#000091]" : "bg-inherit"}`}>
        {checked ? <Check className="text-white" /> : null}
      </div>
      {label && (
        <label className="ml-2">
          {label} <span className="text-[#666666] text-[14px] leading-tight"> {description}</span>
        </label>
      )}
    </div>
  );
}
