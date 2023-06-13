import React, { useEffect, useState } from "react";

export default function RoundRatio({ value, className = "" }) {
  const [arc, setArc] = useState(null);
  const [percentValue, setPercentValue] = useState(null);

  useEffect(() => {
    const radius = 45;
    const center = 50;
    const startAngle = 0;
    const endAngle = 360 * value;
    const start = polarToCartesian(center, center, radius, endAngle);
    const end = polarToCartesian(center, center, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    setArc(["M", start.x, start.y, "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(" "));

    setPercentValue(Math.min(Math.round(value * 100)), 100);
  }, [value]);

  return (
    <div className={`relative ${className}`}>
      <svg width="100%" height="100%" fill="none" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="45" stroke="#F3F4F6" strokeWidth="6" vectorEffect="non-scaling-stroke" />
        {value === 1 ? (
          <circle cx="50" cy="50" r="45" stroke="#1D4ED8" strokeWidth="6" vectorEffect="non-scaling-stroke" />
        ) : (
          <path d={arc} stroke="#1D4ED8" strokeWidth="6" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        )}
      </svg>
      <div className="absolute left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2 text-center text-lg font-bold text-gray-900">
        {percentValue}
        <sup className="text-xs">%</sup>
      </div>
    </div>
  );
}

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  var angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}
