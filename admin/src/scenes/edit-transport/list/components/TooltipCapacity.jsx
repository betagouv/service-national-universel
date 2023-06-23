import React from "react";

const TooltipCapacity = ({ children, youngCapacity, youngSeatsTaken, followerCapacity, ...props }) => {
  return (
    <div className="h-full group relative flex flex-col items-center justify-center" {...props}>
      {children}
      <div className="absolute !top-8 rigth-0 mb-3 hidden flex-col items-center group-hover:flex">
        <div className="leading-2 relative z-[500] whitespace-nowrap rounded-lg bg-white py-3 px-3 text-xs text-[#414458] shadow-lg">
          <div className="flex flex-col">
            <div className="text-sm font-medium">{`Capacité pour jeunes: ${youngSeatsTaken} / ${youngCapacity}`}</div>
            <div className="text-xs text-gray-400">{`Capacité pour accompagnateurs: ${followerCapacity}`}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TooltipCapacity;
