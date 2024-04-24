import React from "react";
import Bin from "@/assets/Bin";

export function DeleteButton({ className = "", onClick = () => {}, mode = "red" }) {
  let modeStyle;
  switch (mode) {
    case "gray":
      modeStyle = "bg-gray-200 text-gray-600 hover:text-gray-200 hover:bg-gray-600 hover:border-gray-600";
      break;
    case "red":
    default:
      modeStyle = "bg-[#EF4444] text-[#FFFFFF] hover:text-[#EF4444] hover:bg-[#FFFFFF] hover:border-[#EF4444]";
  }
  return (
    <div
      className={`group flex h-[32px] w-[32px] cursor-pointer items-center justify-center rounded-[100px] border-[1px] border-[transparent] ${modeStyle} ${className}`}
      onClick={onClick}>
      <Bin className="h-[14px] w-[14px]" />
    </div>
  );
}
