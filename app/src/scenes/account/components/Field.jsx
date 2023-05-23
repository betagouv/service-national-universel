import React from "react";
import Select from "./Select";

export default function Field({ name, label, value, className = "", type = "text", options = [], onChange = () => {}, transformer, maxLength, rows, error }) {
  return (
    <div className={className}>
      <div key={name} className={`relative rounded-[6px] border-[1px] border-[#D1D5DB] bg-white py-[9px] px-[13px] ${error ? "border-[#EF4444]" : "border-[#D1D5DB]"}`}>
        {label && <label className="text-[12px] font-normal leading-[16px] text-[#6B7280]">{label}</label>}
        <>
          {type === "select" && <Select value={value} transformer={transformer} options={options} onChange={onChange} />}
          {type === "text" && <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className={`block w-[100%] p-[5px]`} />}
          {type === "textarea" && <textarea maxLength={maxLength} rows={rows || 4} value={value} onChange={(e) => onChange(e.target.value)} className="block w-[100%] p-[5px]" />}
          {error && <div className="mt-[8px] text-[#EF4444]">{error}</div>}
        </>
      </div>
    </div>
  );
}
