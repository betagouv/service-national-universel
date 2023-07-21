import React from "react";

const PeriodeTab = ({ Icon, name, label, onClick, active }) => {
  return (
    <div className="ml-2 mb-2" onClick={() => onClick(name)}>
      {active ? (
        <div className="flex cursor-pointer items-center justify-center rounded-full border-[1px]  border-blue-600 py-1 px-2 font-medium text-blue-600 hover:border-blue-500 ">
          {label}
          {Icon ? <Icon className="ml-1 text-gray-500" /> : null}
        </div>
      ) : (
        <div className="group flex cursor-pointer items-center justify-center rounded-full border-[1px] border-gray-200 py-1 px-2 font-medium text-gray-700 hover:border-gray-300">
          {label}
          {Icon ? <Icon className="ml-1 text-gray-500" /> : null}
        </div>
      )}
    </div>
  );
};

export default PeriodeTab;
