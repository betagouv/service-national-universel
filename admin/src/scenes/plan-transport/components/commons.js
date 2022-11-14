import React from "react";

export function Title({ children, className = "" }) {
  return <div className={`text-2xl font-bold text-[#242526] leading-7 ${className}`}>{children}</div>;
}

export function SubTitle({ children, className = "" }) {
  return <div className={`text-sm font-normal text-gray-800 leading-[14px] ${className}`}>{children}</div>;
}
