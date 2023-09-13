import React from "react";

const DomainFilter = ({ Icon, name, label, onClick, active }) => {
  return (
    <div className="flex basis-20 cursor-pointer flex-col items-center justify-start space-y-2" onClick={() => onClick(name)}>
      <div className={`${active ? "bg-[#212B44]" : "bg-gray-200"} flex h-9 w-9 items-center justify-center rounded-xl transition duration-200 ease-in`}>
        <Icon className="text-white" />
      </div>
      <div className="text-center text-xs text-gray-700">{label}</div>
    </div>
  );
};

export default DomainFilter;
