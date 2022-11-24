import React from "react";

export function FilterButton({ onClick }) {
  return (
    <div onClick={onClick} className="cursor-pointer bg-[#F3F4F6] w-24 h-10 rounded-md flex flex-row justify-center items-center">
      <svg width={12} height={11} viewBox="0 0 12 11" fill="#9CA3AF" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M0 1a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1.252a1 1 0 0 1-.293.708l-4.08 4.08a1 1 0 0 0-.294.708v1.171a1 1 0 0 1-.293.707l-.666.667c-.63.63-1.707.184-1.707-.707V7.748a1 1 0 0 0-.293-.708L.293 2.96A1 1 0 0 1 0 2.252V1Z"
          fill="#9CA3AF"
        />
      </svg>
      <div className="ml-2 text-grey-700">Filtres</div>
    </div>
  );
}

export const TabItem = ({ active, title, icon, onClick }) => (
  <div
    onClick={onClick}
    className={`text-[13px] px-3 py-2 mr-2 cursor-pointer text-gray-600 rounded-t-lg hover:text-snu-purple-800 ${
      active ? "!text-snu-purple-800 bg-white border-none" : "bg-gray-100 border-t border-x border-gray-200"
    }`}>
    <div className={"flex items-center gap-2"}>
      {icon} {title}
    </div>
  </div>
);
