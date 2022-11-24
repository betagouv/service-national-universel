import React from "react";

export default function Tab({ isActive = false, disabled = false, onClick = () => {}, className = "", children }) {
  let tabClass =
    "shrink-0 text-[#6B7280] text-[14px] font-medium leading-[1.3em] pb-[18px] border-b-[2px] border-b-[transparent] cursor-pointer hover:border-b-[#3B82F6] hover:text-[#3B82F6] ml-[16px] first:ml-0 whitespace-nowrap";
  if (isActive) {
    tabClass += " border-b-[#3B82F6] text-[#3B82F6]";
  }
  if (disabled) {
    tabClass += " opacity-50 cursor-default hover:border-b-[transparent] hover:text-[#6B7280]";
  }

  return (
    <div className={`${tabClass} ${className}`} onClick={onClick}>
      {children}
    </div>
  );
}
