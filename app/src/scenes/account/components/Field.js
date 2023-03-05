import React from "react";
import Select from "./Select";

export default function Field({ name, label, value, className = "", type = "text", options = [], onChange = () => {}, transformer, maxLength, rows, error }) {
  return (
    <div className={className}>
      <div key={name} className={`relative bg-white py-[9px] px-[13px] border-[#D1D5DB] border-[1px] rounded-[6px] ${error ? "border-[#EF4444]" : "border-[#D1D5DB]"}`}>
        {label && <label className="font-normal text-[12px] leading-[16px] text-[#6B7280]">{label}</label>}
        <>
          {type === "select" && <Select value={value} transformer={transformer} options={options} onChange={onChange} />}
          {type === "text" && <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className={`block p-[5px] w-[100%]`} />}
          {type === "textarea" && <textarea maxLength={maxLength} rows={rows || 4} value={value} onChange={(e) => onChange(e.target.value)} className="block p-[5px] w-[100%]" />}
          {error && <div className="text-[#EF4444] mt-[8px]">{error}</div>}
        </>
      </div>
    </div>
  );
}
