import React from "react";
import ChevronRight from "../../../assets/icons/ChevronRight";

export const ActionButton = ({ onClick, children, icon = <></> }) => {
  return (
    <button className="my-2 p-7 border border-gray-200 rounded-lg text-gray-700 w-full md:w-[335px] h-[86px] flex items-center" onClick={onClick}>
      {icon}
      <div className="flex-1 text-start font-medium text-[13px] md:text-sm">{children}</div>
      <div className="rounded-full flex justify-center items-center bg-[#2563EB] w-8 h-8">
        <ChevronRight className="text-white" />
      </div>
    </button>
  );
};
export const Title = ({ children, className = "" }) => <h1 className={`font-medium md:text-center text-xl text-gray-900 mb-2 ${className}`}>{children}</h1>;
export const SubTitle = ({ children, className = "" }) => <span className={`text-gray-500 text-sm md:text-center mb-7 ${className}`}>{children}</span>;
