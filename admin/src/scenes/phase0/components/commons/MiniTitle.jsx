import React from "react";

export function MiniTitle({ children, className = "" }) {
  return <div className={`mb-[8px] text-[12px] font-medium leading-snug text-[#242526] ${className}`}>{children}</div>;
}
