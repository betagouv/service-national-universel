import React from "react";
import { BigDigits } from "./commons";

export default function ProgressArc({ total, value, legend = null, hilight = null, className = "" }) {
  const rate = typeof total === "number" && total !== 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div className={`${className}`}>
      <div className={`rounded-[5px] bg-[#E5E7EB] h-[4px] mb-[8px] ${className}`}>
        <div className={`h-[100%] bg-[#303958]`} style={{ width: rate + "%" }} />
      </div>
      <div className="">
        <div className="text-[11px] leading-[14px] text-[#1F2937] mb-[2px] text-center">{legend}</div>
        <BigDigits className="text-center">{hilight}</BigDigits>
      </div>
    </div>
  );
}
