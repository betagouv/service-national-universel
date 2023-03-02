import React from "react";

export default function SimpleCheckbox({ value, title, detail, onChange, className = "" }) {
  return (
    <div className={`flex items-center cursor-pointer relative ${className}`} onClick={() => onChange(!value)}>
      <input type="checkbox" className="shrink-0" checked={value === true} readOnly />
      <div className={`grow text-[13px] ml-4 ${value ? "text-gray-700" : "text-gray-400"}`}>
        <div>{title}</div>
        {detail && <div className="text-[15px]">{detail}</div>}
      </div>
    </div>
  );
}
