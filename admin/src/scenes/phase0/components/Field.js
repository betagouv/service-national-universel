import React from "react";
import PencilAlt from "../../../assets/icons/PencilAlt";

export default function Field({ name, label, value, onChange, className = "" }) {
  return (
    <div className={`relative bg-white py-[9px] px-[13px] border-[#D1D5DB] border-[1px] rounded-[6px] group ${className}`} key={name}>
      <label className="font-normal text-[12px] leading-[16px] text-[#6B7280]">{label}</label>
      <div className="font-normal text-[14px] leading-[20px] text-[#1F2937]">{value}</div>
      <div className="hidden group-hover:block absolute top-[11px] right-[11px] p-[9px] rounded-[100px] bg-[#FFEDD5] cursor-pointer group hover:bg-[#F97316]">
        <PencilAlt className="w-[14px] h-[14px] text-[#F97316] group-hover:text-white" />
      </div>
    </div>
  );
}

