import React from "react";
import Plus from "@/assets/icons/Plus";

export function AddButton({ className = "", onClick = () => {} }) {
  return (
    <div
      className={`group flex h-[32px] w-[32px] cursor-pointer items-center justify-center rounded-[100px] border-[1px] border-[transparent] bg-[#E5E7EB] bg-[#E5E7EB] hover:bg-[#4B5563] ${className}`}
      onClick={onClick}>
      <Plus className="h-[14px] w-[14px] text-[#FFFFFF] group-hover:text-[#FFFFFF]" />
    </div>
  );
}
