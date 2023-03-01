import React from "react";
import Download from "../../../assets/icons/Download";
import Plus from "../../../assets/icons/Plus";
import Bin from "../../../assets/Bin";

export function MiniTitle({ children, className = "" }) {
  return <div className={`font-medium text-[12px] text-[#242526] leading-snug mb-[8px] ${className}`}>{children}</div>;
}

export function DownloadButton({ className = "", onClick = () => {}, href, target, rel }) {
  if (href) {
    return (
      <a
        className={`flex items-center justify-center w-[32px] h-[32px] rounded-[100px] bg-[#2563EB] cursor-pointer group hover:bg-[#DBEAFE] ${className}`}
        href={href}
        target={target}
        rel={rel}
        onClick={onClick}>
        <Download className="w-[14px] h-[14px] text-[#DBEAFE] group-hover:text-[#2563EB]" />
      </a>
    );
  } else {
    return (
      <div className={`flex items-center justify-center w-[32px] h-[32px] rounded-[100px] bg-[#2563EB] cursor-pointer group hover:bg-[#DBEAFE] ${className}`} onClick={onClick}>
        <Download className="w-[14px] h-[14px] text-[#DBEAFE] group-hover:text-[#2563EB]" />
      </div>
    );
  }
}

export function MoreButton({ className = "", onClick = () => {} }) {
  return (
    <div
      className={`flex items-center justify-center w-[32px] h-[32px] rounded-[100px] bg-[#E5E7EB] cursor-pointer group hover:bg-[#4B5563] flex items-center justify-center ${className}`}
      onClick={onClick}>
      <div className="bg-[#4B5563] w-[2px] h-[2px] mr-[2px] group-hover:bg-white" />
      <div className="bg-[#4B5563] w-[2px] h-[2px] mr-[2px] group-hover:bg-white" />
      <div className="bg-[#4B5563] w-[2px] h-[2px] group-hover:bg-white" />
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
      className={`flex items-center justify-center w-[32px] h-[32px] rounded-[100px] cursor-pointer group border-[1px] border-[transparent] ${modeStyle} ${className}`}
      onClick={onClick}>
      <Bin className="w-[14px] h-[14px]" />
    </div>
  );
}

export function AddButton({ className = "", onClick = () => {} }) {
  return (
    <div
      className={`flex items-center justify-center w-[32px] h-[32px] rounded-[100px] bg-[#E5E7EB] cursor-pointer group border-[1px] border-[transparent] hover:bg-[#4B5563] bg-[#E5E7EB] ${className}`}
      onClick={onClick}>
      <Plus className="w-[14px] h-[14px] text-[#FFFFFF] group-hover:text-[#FFFFFF]" />
    </div>
  );
}
