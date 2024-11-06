import React from "react";
import Download from "@/assets/icons/Download";

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
