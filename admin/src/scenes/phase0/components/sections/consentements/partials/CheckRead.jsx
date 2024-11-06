import React from "react";
import Check from "@/assets/icons/Check";

export default function CheckRead({ value, children }) {
  return (
    <div className="mt-[16px] flex items-center">
      <div className="mr-[24px] flex h-[14px] w-[14px] flex-[0_0_14px] items-center justify-center rounded-[4px] bg-[#E5E5E5] text-[#666666]">
        {value && <Check className="h-[8px] w-[11px]" />}
      </div>
      <div className="grow text-[14px] leading-[19px] text-[#3A3A3A]">{children}</div>
    </div>
  );
}
