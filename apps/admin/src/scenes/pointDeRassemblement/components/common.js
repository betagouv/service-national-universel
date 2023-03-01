import React from "react";

export function Title({ children, className = "" }) {
  return <div className={`text-2xl font-bold text-[#242526] leading-7 ${className}`}>{children}</div>;
}

export function SubTitle({ children, className = "" }) {
  return <div className={`text-sm font-normal text-gray-800 leading-[14px] ${className}`}>{children}</div>;
}

export function Loading({ width }) {
  return (
    <div className={`animate-pulse flex space-x-4 ${width}`}>
      <div className="flex-1 space-y-6">
        <div className="grid grid-cols-3 gap-4 ">
          <div className="h-2 bg-gray-300 rounded col-span-2"></div>
          <div className="h-2 bg-gray-300 rounded col-span-1"></div>
        </div>
      </div>
    </div>
  );
}

export const TabItem = ({ active, title, icon, onClick }) => (
  <div
    onClick={onClick}
    className={`text-[13px] px-3 py-2 mr-2 cursor-pointer text-gray-600 rounded-t-lg hover:text-snu-purple-800 ${
      active ? "!text-snu-purple-800 bg-white border-none" : "bg-gray-100 border-t border-x border-gray-200"
    }`}>
    <div className={"flex items-center gap-2"}>
      {icon} {title}
    </div>
  </div>
);
