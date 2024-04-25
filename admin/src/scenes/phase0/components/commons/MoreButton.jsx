import React from "react";

export function MoreButton({ className = "", onClick = () => {} }) {
  return (
    <div
      className={`group flex flex h-[32px] w-[32px] cursor-pointer items-center items-center justify-center justify-center rounded-[100px] bg-[#E5E7EB] hover:bg-[#4B5563] ${className}`}
      onClick={onClick}>
      <div className="mr-[2px] h-[2px] w-[2px] bg-[#4B5563] group-hover:bg-white" />
      <div className="mr-[2px] h-[2px] w-[2px] bg-[#4B5563] group-hover:bg-white" />
      <div className="h-[2px] w-[2px] bg-[#4B5563] group-hover:bg-white" />
    </div>
  );
}
