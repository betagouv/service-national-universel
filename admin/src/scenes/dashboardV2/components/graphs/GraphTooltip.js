import React from "react";
export default function GraphTooltip({ children, className = "", style = {} }) {
  return (
    <div
      className={`rounded-lg bg-gray-900 px-[20px] py-[10px] font-extrabold text-sm text-[#FFFFFF] text-center w-min hidden group-hover:block absolute bottom-[calc(100%+17px)] left-[50%] translate-x-[-50%] pointer-events-none ${className}`}
      style={style}>
      <div className="w-[20px] h-[20px] absolute bottom-[-10px] left-[50%] translate-x-[-50%] rotate-45 bg-gray-900" />
      {children}
    </div>
  );
}
