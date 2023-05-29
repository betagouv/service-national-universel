import React from "react";

export default function MiniSwitch({ value, className }) {
  return (
    <div className={`relative h-[16px] w-[36px] rounded-[36px] ${value ? "bg-[#10B981]" : "bg-[#EF4444]"} ${className}`}>
      <div
        className={`absolute top-[-2px] h-[20px] w-[20px] rounded-[20px] border-[1px] border-[#E5E7EB] bg-[#FFFFFF] shadow-[0_1px_3px_rgb(0,0,0,0.1),0_1px_2px_rgb(0,0,0,0.06)] ${
          value ? "right-[-2px]" : "left-[-2px]"
        }`}
      />
    </div>
  );
}
