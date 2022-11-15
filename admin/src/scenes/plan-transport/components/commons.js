import React from "react";

export function Title({ children, className = "" }) {
  return <div className={`text-2xl font-bold text-[#242526] leading-7 ${className}`}>{children}</div>;
}

export function SubTitle({ children, className = "" }) {
  return <div className={`text-sm font-normal text-gray-800 leading-[14px] ${className}`}>{children}</div>;
}

export function Box({ children, className = "" }) {
  return (
    <div className={`bg-[#FFFFFF] rounded-[8px] shadow-[0px_2px_4px_rgba(0,0,0,0.05)] text-[14px] leading-[20px] text-[#1F2937] px-[28px] py-[24px] ${className}`}>{children}</div>
  );
}
