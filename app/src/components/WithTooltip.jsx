import React from "react";

export default function WithTooltip({ children, tooltipText, ...props }) {
  if (!tooltipText) return children;

  return (
    <div className="group relative flex flex-col items-center" {...props}>
      {children}
      <div className="absolute !bottom-2 mb-3 flex hidden flex-col items-center group-hover:flex ">
        <span className="leading-2 relative z-[500] whitespace-nowrap rounded-lg bg-white py-2 px-2.5 text-center text-xs text-[#414458] shadow-sm">{tooltipText}</span>
        <svg id="triangle" viewBox="0 0 100 100" width={10} height={10} className="z-[600] mx-3">
          <polygon points="0 0, 100 0, 50 55" fill="white" />
        </svg>
      </div>
    </div>
  );
}
