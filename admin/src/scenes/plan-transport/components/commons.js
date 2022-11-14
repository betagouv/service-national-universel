import React from "react";

export default function Title({ children, className = "" }) {
  return <div className={`text-[23px] font-bold text-[#111827] leading-[28px] ${className}`}>{children}</div>;
}
