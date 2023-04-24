import React from "react";
import RoundRatio from "../../../../components/graphs/RoundRatio";
import { Link } from "react-router-dom";

export default function BoxWithPercentage({ total, title, number, subLabel, redirect }) {
  const value = total ? (total - number) / total : 0;
  return (
    <Link className="flex h-[102px] items-center justify-between gap-2 rounded-lg bg-white px-6 py-4 shadow-[0_8px_16px_rgba(0,0,0,0.05)]" to={redirect} target="_blank">
      <div className="flex flex-col gap-2">
        <p className="text-base font-bold leading-5 text-gray-900">{title}</p>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold leading-7 text-gray-900">{number}</span>
          <p className="text-sm leading-3 text-gray-600">{subLabel}</p>
        </div>
      </div>
      <RoundRatio value={value} className="h-[64px] w-[64px]" />
    </Link>
  );
}
