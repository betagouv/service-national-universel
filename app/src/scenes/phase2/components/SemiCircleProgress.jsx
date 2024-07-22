import React from "react";

export const SemiCircleProgress = ({ current, total }) => {
  const progress = (Math.min(current, total) / total) * 100;
  return (
    <svg className="h-80 pb-8 mx-auto" viewBox="0 0 110 100">
      <linearGradient id="gradient" x1="0" y1="0" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#7197eb" />
        <stop offset="50%" stopColor="#2865eb" />
      </linearGradient>
      <path strokeWidth="9" strokeLinecap="round" className="stroke-gray-200" d="M30,90 A40,40 0 1,1 80,90" fill="none" />
      <path
        strokeWidth="9"
        strokeLinecap="round"
        stroke="url(#gradient)"
        fill="none"
        strokeDasharray="198"
        strokeDashoffset={198 - (progress * 198) / 100}
        d="M30,90 A40,40 0 1,1 80,90"
      />
      <text x="50%" y="47%" fontSize=".3em" dominantBaseline="middle" textAnchor="middle">
        {current == 0 ? "Vous avez" : "Vous avez réalisé"}
      </text>
      {current > 0 && (
        <text x="42%" y="57%" fontSize=".7em" fill="url(#gradient)" dominantBaseline="middle" textAnchor="middle">
          {current}h
        </text>
      )}
      <text x={current == 0 ? "50%" : "60%"} y="57%" fontSize=".7em" dominantBaseline="middle" textAnchor="middle">
        {current == 0 ? `${total}h` : `/${total}`}
      </text>
      <text x="50%" y="65%" fontSize=".3em" fill="gray" dominantBaseline="middle" textAnchor="middle">
        {current == 0 && "à réaliser"}
        {current >= total && "félicitations"}
        {current != 0 && current < total && `Plus que ${total - current}h`}
      </text>
      <text x="50%" y="95%" dominantBaseline="middle" textAnchor="middle">
        {current >= total ? "👏" : "🚀"}
      </text>
    </svg>
  );
};

export default SemiCircleProgress;
