import React from "react";

export default function SimpleInput({ value, title, onChange, placeholder = "", className = "" }) {
  return (
    <div className={`flex items-center justify-between cursor-pointer p-2 border rounded-md relative ${className}`}>
      <div className="grow">
        {title && <div className="text-sm text-gray-500">{title}</div>}
        <input type="text" className="text-sm text-gray-800 border-0 w-[100%]" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      </div>
    </div>
  );
}
