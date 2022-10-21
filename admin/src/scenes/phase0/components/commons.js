import React from "react";
import PencilAlt from "../../../assets/icons/PencilAlt";
import Download from "../../../assets/icons/Download";

export function MiniTitle({ children }) {
  return <div className="font-medium text-[12px] text-[#242526] leading-snug mb-[8px]">{children}</div>;
}

export function CorrectionButton({ className = "", onClick = () => {} }) {
  return (
    <div className={`flex items-center justify-center w-[32px] h-[32px] rounded-[100px] bg-[#FFEDD5] cursor-pointer group hover:bg-[#F97316] ${className}`} onClick={onClick}>
      <PencilAlt className="w-[14px] h-[14px] text-[#F97316] group-hover:text-white" />
    </div>
  );
}

export function DownloadButton({ className = "", onClick = () => {} }) {
  return (
    <div className={`flex items-center justify-center w-[32px] h-[32px] rounded-[100px] bg-[#2563EB] cursor-pointer group hover:bg-[#DBEAFE] ${className}`} onClick={onClick}>
      <Download className="w-[14px] h-[14px] text-[#DBEAFE] group-hover:text-[#2563EB]" />
    </div>
  );
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
