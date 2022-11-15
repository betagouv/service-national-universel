import React from "react";

export default function ProgressArc({ total, value, legend = null, hilight = null, className = "" }) {
  const rate = typeof total === "number" && total !== 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div className={`rounded-[5px] bg-[#E5E7EB] h-[4px] ${className}`}>
      <div className={`h-[100%] w-[${rate}%] bg-[#303958]`} />
      <div className="">{legend}</div>
      <div className="">{hilight}</div>
    </div>
  );
}
