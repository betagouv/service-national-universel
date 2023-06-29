import React from "react";

const TooltipCenter = ({ children, name, region, department, ...props }) => {
  return (
    <div className="group relative flex flex-col items-center" {...props}>
      {children}
      <div className="absolute !top-8 left-0 mb-3 hidden flex-col items-center group-hover:flex">
        <div className="leading-2 relative z-[500] whitespace-nowrap rounded-lg bg-white py-3 px-3 text-xs text-[#414458] shadow-lg">
          <div className="flex flex-col">
            <div className="text-sm font-medium">{`${name}`}</div>
            <div className="text-xs text-gray-400">{`${region} • ${department}`}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TooltipCenter;
