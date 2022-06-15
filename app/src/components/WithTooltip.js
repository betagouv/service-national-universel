import React from "react";

export default function WithTooltip({ children, tooltipText, ...props }) {
  if (!tooltipText) return children;

  return (
    <div className="relative flex flex-col items-center group" {...props}>
      {children}
      <div className="absolute flex flex-col hidden group-hover:flex !bottom-2 mb-3 items-center ">
        <span className="relative py-2 px-2.5 text-xs leading-2 text-[#414458] whitespace-no-wrap bg-white shadow-sm z-[500] rounded-lg text-center">{tooltipText}</span>
        <svg id="triangle" viewBox="0 0 100 100" width={10} height={10} className="z-[600] mx-3">
          <polygon points="0 0, 100 0, 50 55" fill="white" />
        </svg>
      </div>
    </div>
  );
}
