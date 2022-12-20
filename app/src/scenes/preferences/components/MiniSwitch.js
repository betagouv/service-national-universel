import React from "react";

export default function MiniSwitch({ value, className }) {
  return (
    <div className={`relative w-[36px] h-[16px] rounded-[36px] shrink-0 ${value ? "bg-blue-600" : "bg-gray-200"} ${className}`}>
      <div
        className={`w-[20px] h-[20px] bg-[#FFFFFF] rounded-[20px] border-[#E5E7EB] border-[1px] absolute top-[-2px] shadow-[0_1px_3px_rgb(0,0,0,0.1),0_1px_2px_rgb(0,0,0,0.06)] ${
          value ? "right-[-2px]" : "left-[-2px]"
        }`}
      />
    </div>
  );
}
