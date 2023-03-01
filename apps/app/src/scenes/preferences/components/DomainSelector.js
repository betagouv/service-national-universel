import React from "react";

export default function DomainSelector({ title, icon, onClick = () => {}, children, className = "", selected = false }) {
  return (
    <div className={`flex flex-col md:flex-row items-center md:border md:border-gray-200 md:rounded-lg md:p-4 cursor-pointer md:hover:shadow-lg ${className}`} onClick={onClick}>
      <div className={`shrink-0 flex items-center justify-center w-[36px] h-[36px] text-[#FFFFFF] rounded-xl ${selected ? "bg-[#212B44]" : "bg-gray-200"}`}>{icon}</div>
      <div className="md:grow md:ml-4 mt-1 md:mt-0">
        <div className="font-medium text-xs md:text-sm text-center md:text-left text-gray-700 mb-[1px]">{title}</div>
        <div className="hidden md:block text-xs text-gray-500">{children}</div>
      </div>
    </div>
  );
}
