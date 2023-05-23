import React from "react";

export function Title({ children, className = "" }) {
  return <div className={`text-2xl font-bold leading-7 text-[#242526] ${className}`}>{children}</div>;
}

export function SubTitle({ children, className = "" }) {
  return <div className={`text-sm font-normal leading-[14px] text-gray-800 ${className}`}>{children}</div>;
}

export function Loading({ width }) {
  return (
    <div className={`flex animate-pulse space-x-4 ${width}`}>
      <div className="flex-1 space-y-6">
        <div className="grid grid-cols-3 gap-4 ">
          <div className="col-span-2 h-2 rounded bg-gray-300"></div>
          <div className="col-span-1 h-2 rounded bg-gray-300"></div>
        </div>
      </div>
    </div>
  );
}

export const TabItem = ({ active, title, icon, onClick }) => (
  <div
    onClick={onClick}
    className={`mr-2 cursor-pointer rounded-t-lg px-3 py-2 text-[13px] text-gray-600 hover:text-snu-purple-800 ${
      active ? "border-none bg-white !text-snu-purple-800" : "border-x border-t border-gray-200 bg-gray-100"
    }`}>
    <div className={"flex items-center gap-2"}>
      {icon} {title}
    </div>
  </div>
);
