import React from "react";

export default function DomainSelector({ title, icon, onClick = () => {}, children, className = "", selected = false }) {
  return (
    <div className={`flex items-center border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-lg ${className}`} onClick={onClick}>
      <div className={`shrink-0 flex items-center justify-center w-[36px] h-[36px] text-[#FFFFFF] rounded-xl ${selected ? "bg-[#212B44]" : "bg-gray-200"}`}>{icon}</div>
      <div className="grow ml-4">
        <div className="font-medium text-sm text-gray-700 mb-[1px]">{title}</div>
        <div className="text-xs text-gray-500">{children}</div>
      </div>
    </div>
  );
}
