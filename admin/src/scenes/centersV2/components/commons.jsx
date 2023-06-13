import React from "react";

export function FilterButton({ onClick }) {
  return (
    <div onClick={onClick} className="flex h-10 w-24 cursor-pointer flex-row items-center justify-center rounded-md bg-[#F3F4F6]">
      <svg width={12} height={11} viewBox="0 0 12 11" fill="#9CA3AF" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M0 1a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1.252a1 1 0 0 1-.293.708l-4.08 4.08a1 1 0 0 0-.294.708v1.171a1 1 0 0 1-.293.707l-.666.667c-.63.63-1.707.184-1.707-.707V7.748a1 1 0 0 0-.293-.708L.293 2.96A1 1 0 0 1 0 2.252V1Z"
          fill="#9CA3AF"
        />
      </svg>
      <div className="text-grey-700 ml-2">Filtres</div>
    </div>
  );
}
export function Title({ children, className = "" }) {
  return <div className={`text-2xl font-bold leading-7 text-[#242526] ${className}`}>{children}</div>;
}

export function SubTitle({ children, className = "" }) {
  return <div className={`text-sm font-normal leading-[14px] text-gray-800 ${className}`}>{children}</div>;
}
export const TabItem = ({ active, title, icon, onClick }) => (
  <div
    onClick={onClick}
    className={`mr-2 cursor-pointer rounded-t-lg px-3 py-2 text-[13px] text-gray-600 hover:text-snu-purple-800 ${
      active ? "border-none bg-white !text-snu-purple-800" : "border-x border-t border-gray-200 bg-gray-100"
    }`}>
    <div className={"flex items-center gap-2"}>
      {icon} {title}
    </div>
  </div>
);
export const Badge = ({ cohort, onClick }) => {
  return (
    <div
      key={cohort}
      onClick={onClick}
      className={`w-fit cursor-pointer rounded-full border-[1px] px-3 py-1 text-xs font-medium leading-5 ${"border-[#0C7CFF] bg-[#F9FCFF] text-[#0C7CFF] "}`}>
      {cohort.cohort}
    </div>
  );
};

export const Loading = ({ width }) => {
  return (
    <div className={`flex animate-pulse space-x-4 ${width}`}>
      <div className="flex-1 space-y-6">
        <div className="grid grid-cols-3 gap-4 ">
          <div className="col-span-2 h-2 rounded bg-gray-300"></div>
          <div className="col-span-1 h-2 rounded bg-gray-300"></div>
        </div>
      </div>
    </div>
  );
};
