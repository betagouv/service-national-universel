import React from "react";
export default function GraphTooltip({ children, className = "", style = {} }) {
  return (
    <div
      className={`pointer-events-none absolute bottom-[calc(100%+17px)] left-[50%] hidden w-min translate-x-[-50%] rounded-lg bg-gray-900 px-[20px] py-[10px] text-center text-sm font-bold text-[#FFFFFF] group-hover:block ${className}`}
      style={style}>
      <div className="absolute bottom-[-10px] left-[50%] h-[20px] w-[20px] translate-x-[-50%] rotate-45 bg-gray-900" />
      {children}
    </div>
  );
}
