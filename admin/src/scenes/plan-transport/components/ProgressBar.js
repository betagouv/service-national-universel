import React from "react";

export default function ProgressBar({ total, value, className = "" }) {
  const rate = typeof total === "number" && total !== 0 ? Math.max(0, Math.min(100, Math.round((value / total) * 100))) : 0;

  return (
    <div className={`rounded-[5px] bg-[#E5E7EB] h-[4px] ${className}`}>
      <div className={`h-[100%] bg-[#303958]`} style={{ width: rate + "%" }} />
    </div>
  );
}
