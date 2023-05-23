import React from "react";
import Download from "../../../assets/icons/Download";
import Plus from "../../../assets/icons/Plus";
import Bin from "../../../assets/Bin";

export function MiniTitle({ children, className = "" }) {
  return <div className={`mb-[8px] text-[12px] font-medium leading-snug text-[#242526] ${className}`}>{children}</div>;
}

export function DownloadButton({ className = "", onClick = () => {}, href, target, rel }) {
  if (href) {
    return (
      <a
        className={`group flex h-[32px] w-[32px] cursor-pointer items-center justify-center rounded-[100px] bg-[#2563EB] hover:bg-[#DBEAFE] ${className}`}
        href={href}
        target={target}
        rel={rel}
        onClick={onClick}>
        <Download className="h-[14px] w-[14px] text-[#DBEAFE] group-hover:text-[#2563EB]" />
      </a>
    );
  } else {
    return (
      <div className={`group flex h-[32px] w-[32px] cursor-pointer items-center justify-center rounded-[100px] bg-[#2563EB] hover:bg-[#DBEAFE] ${className}`} onClick={onClick}>
        <Download className="h-[14px] w-[14px] text-[#DBEAFE] group-hover:text-[#2563EB]" />
      </div>
    );
  }
}

export function MoreButton({ className = "", onClick = () => {} }) {
  return (
    <div
      className={`group flex flex h-[32px] w-[32px] cursor-pointer items-center items-center justify-center justify-center rounded-[100px] bg-[#E5E7EB] hover:bg-[#4B5563] ${className}`}
      onClick={onClick}>
      <div className="mr-[2px] h-[2px] w-[2px] bg-[#4B5563] group-hover:bg-white" />
      <div className="mr-[2px] h-[2px] w-[2px] bg-[#4B5563] group-hover:bg-white" />
      <div className="h-[2px] w-[2px] bg-[#4B5563] group-hover:bg-white" />
    </div>
  );
}

export function DeleteButton({ className = "", onClick = () => {}, mode = "red" }) {
  let modeStyle;
  switch (mode) {
    case "gray":
      modeStyle = "bg-gray-200 text-gray-600 hover:text-gray-200 hover:bg-gray-600 hover:border-gray-600";
      break;
    case "red":
    default:
      modeStyle = "bg-[#EF4444] text-[#FFFFFF] hover:text-[#EF4444] hover:bg-[#FFFFFF] hover:border-[#EF4444]";
  }
  return (
    <div
      className={`group flex h-[32px] w-[32px] cursor-pointer items-center justify-center rounded-[100px] border-[1px] border-[transparent] ${modeStyle} ${className}`}
      onClick={onClick}>
      <Bin className="h-[14px] w-[14px]" />
    </div>
  );
}

export function AddButton({ className = "", onClick = () => {} }) {
  return (
    <div
      className={`group flex h-[32px] w-[32px] cursor-pointer items-center justify-center rounded-[100px] border-[1px] border-[transparent] bg-[#E5E7EB] bg-[#E5E7EB] hover:bg-[#4B5563] ${className}`}
      onClick={onClick}>
      <Plus className="h-[14px] w-[14px] text-[#FFFFFF] group-hover:text-[#FFFFFF]" />
    </div>
  );
}
