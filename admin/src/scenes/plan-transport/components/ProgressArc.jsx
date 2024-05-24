import React from "react";
import { BigDigits } from "./commons";

export default function ProgressArc({ total, value, legend = "", hilight = 0, className = "", mode = "green", strokeWidth = 160 }) {
  let backColor, valueColor;
  switch (mode) {
    case "red":
      backColor = "#E38760";
      valueColor = "#DC5318";
      break;
    case "green":
    default:
      backColor = "#63B59A";
      valueColor = "#6EC898";
  }
  const angle = typeof total === "number" && total !== 0 ? (value / total) * Math.PI : 0;
  const radius = (1000 - strokeWidth) / 2;

  const dx = Math.cos(Math.PI - angle) * radius + radius;
  const dy = Math.sin(Math.PI - angle) * -radius;

  return (
    <div className={`relative h-[100%] overflow-hidden rounded-t-full ${className}`}>
      <div className="h-[200%] w-[100%]">
        <svg viewBox="0 0 1000 1000" width="100%" height="100%">
          <path d={`M ${strokeWidth / 2} 500 a ${radius} ${radius} 180 0 1 ${1000 - strokeWidth} 0`} fill="#F2F5FC" stroke="none" />
          <path d={`M ${strokeWidth / 2} 500 a ${radius} ${radius} 180 0 1 ${1000 - strokeWidth} 0`} fill="none" stroke={backColor} strokeWidth={strokeWidth} />
          <path d={`M ${strokeWidth / 2} 500 a ${radius} ${radius} 180 0 1 ${dx} ${dy}`} fill="none" stroke={valueColor} strokeWidth={strokeWidth} />
        </svg>
      </div>
      <div className="absolute bottom-[14px] left-[50%] translate-x-[-50%]">
        <div className="mb-[2px] text-center text-[11px] leading-[14px] text-[#1F2937]">{legend}</div>
        <BigDigits className="text-center">{hilight}</BigDigits>
      </div>
    </div>
  );
}
