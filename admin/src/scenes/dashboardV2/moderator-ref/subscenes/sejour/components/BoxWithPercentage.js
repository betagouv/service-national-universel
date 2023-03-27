import React from "react";
import RoundRatio from "../../../../components/graphs/RoundRatio";

export default function BoxWithPercentage({ total, title, number, subLabel }) {
  const value = total ? number / total : 0;
  return (
    <div className="flex items-center justify-between gap-2 bg-white rounded-lg shadow-[0_8px_16px_rgba(0,0,0,0.05)] px-6 py-4 h-[102px]">
      <div className="flex flex-col gap-2">
        <p className="text-base leading-5 font-bold text-gray-900">{title}</p>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold leading-7 text-gray-900">{number}</span>
          <p className="text-sm leading-3 text-gray-600">{subLabel}</p>
        </div>
      </div>
      <RoundRatio value={value} className="w-[64px] h-[64px]" />
    </div>
  );
}
