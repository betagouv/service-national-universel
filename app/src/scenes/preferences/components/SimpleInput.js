import React from "react";

export default function SimpleInput({ value, title, onChange, placeholder = "", className = "", error }) {
  return (
    <div className={`relative flex cursor-pointer items-center justify-between rounded-md border p-2 ${className}`}>
      <div className="grow">
        {title && <div className="text-sm text-gray-500">{title}</div>}
        <input type="text" className="w-[100%] border-0 text-sm text-gray-800" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
        {error && <div className="mt-2 text-sm text-[#F71701]">{error}</div>}
      </div>
    </div>
  );
}
