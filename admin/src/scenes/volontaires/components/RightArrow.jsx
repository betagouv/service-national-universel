import React from "react";
export default function RightArrow() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36" fill="none" className="pt-0.5">
      <g filter="url(#filter0_d_12796_150431)">
        <rect x="2" y="1" width="32" height="32" rx="16" fill="#2563EB" />
        <path d="M15.5 11.1666L21.3333 16.9999L15.5 22.8333" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <defs>
        <filter id="filter0_d_12796_150431" x="0" y="0" width="36" height="36" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feOffset dy="1" />
          <feGaussianBlur stdDeviation="1" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_12796_150431" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_12796_150431" result="shape" />
        </filter>
      </defs>
    </svg>
  );
}
