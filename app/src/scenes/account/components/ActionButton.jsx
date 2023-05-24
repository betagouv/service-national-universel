import React from "react";
import ChevronRight from "../../../assets/icons/ChevronRight";

const ActionButton = ({ onClick, children, icon = <></> }) => {
  return (
    <button className="my-2 flex h-[86px] w-full items-center rounded-lg border border-gray-200 p-7 text-gray-700 md:w-[335px]" onClick={onClick}>
      {icon}
      <div className="flex-1 text-start text-[13px] font-medium md:text-sm">{children}</div>
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2563EB]">
        <ChevronRight className="text-white" />
      </div>
    </button>
  );
};

export default ActionButton;
