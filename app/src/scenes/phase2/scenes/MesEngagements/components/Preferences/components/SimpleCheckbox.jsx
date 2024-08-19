import React from "react";

export default function SimpleCheckbox({ value, title, detail, onChange, className = "" }) {
  return (
    <div className={`relative flex cursor-pointer items-center ${className}`} onClick={() => onChange(!value)}>
      <input type="checkbox" className="shrink-0" checked={value === true} readOnly />
      <div className={`ml-4 grow text-[13px] ${value ? "text-gray-700" : "text-gray-400"}`}>
        <div>{title}</div>
        {detail && <div className="text-[15px]">{detail}</div>}
      </div>
    </div>
  );
}
