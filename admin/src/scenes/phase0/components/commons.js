import React from "react";
import Download from "../../../assets/icons/Download";

export function MiniTitle({ children }) {
  return <div className="font-medium text-[12px] text-[#242526] leading-snug mb-[8px]">{children}</div>;
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
