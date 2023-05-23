import React from "react";

export default function DomainSelector({ title, icon, onClick = () => {}, children, className = "", selected = false }) {
  return (
    <div className={`flex cursor-pointer flex-col items-center md:flex-row md:rounded-lg md:border md:border-gray-200 md:p-4 md:hover:shadow-lg ${className}`} onClick={onClick}>
      <div className={`flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-xl text-[#FFFFFF] ${selected ? "bg-[#212B44]" : "bg-gray-200"}`}>{icon}</div>
      <div className="mt-1 md:ml-4 md:mt-0 md:grow">
        <div className="mb-[1px] text-center text-xs font-medium text-gray-700 md:text-left md:text-sm">{title}</div>
        <div className="hidden text-xs text-gray-500 md:block">{children}</div>
      </div>
    </div>
  );
}
