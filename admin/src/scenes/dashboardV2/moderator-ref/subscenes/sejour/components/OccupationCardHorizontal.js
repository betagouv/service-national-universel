import React from "react";

export default function OccupationCardHorizontal({ total, taken }) {
  let width = `w-0`;
  let bgColor = "bg-blue-700";
  let occupationPercentage = 10;

  if (isNaN(occupationPercentage)) occupationPercentage = 0;

  occupationPercentage = (taken / total) * 100;

  if (occupationPercentage < 20) width = "w-[20%]";
  else if (occupationPercentage < 30) width = "w-[30%]";
  else if (occupationPercentage < 40) width = "w-[40%]";
  else if (occupationPercentage < 50) width = "w-[50%]";
  else if (occupationPercentage < 60) width = "w-[60%]";
  else if (occupationPercentage < 70) width = "w-[70%]";
  else if (occupationPercentage < 80) width = "w-[80%]";
  else if (occupationPercentage < 100) width = "w-[90%]";
  else if (occupationPercentage >= 100) width = "w-[100%]";

  return (
    <div className="relative flex flex-col gap-2 bg-white w-full rounded-lg px-6 py-4 shadow-[0_8px_16px_rgba(0,0,0,0.05)] h-[102px]">
      <p className="text-base leading-5 font-bold text-gray-900">Places</p>
      <div className="">
        {Math.floor(occupationPercentage) === 0 ? (
          <div className="flex flex-col justify-center items-center w-full h-[6px] bg-gray-100 rounded-full overflow-hidden" />
        ) : (
          <div className="flex flex-col justify-end h-[6px] bg-gray-100 rounded-full overflow-hidden">
            <div className={`flex justify-center items-center h-[6px] ${width} ${bgColor} rounded-full`} />
          </div>
        )}
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="rounded-full w-[7px] h-[7px] bg-blue-700" />
          <p className="text-xs text-gray-600">
            <span className="font-bold text-gray-900">{taken}</span> occupées
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-full w-[7px] h-[7px] bg-gray-200" />
          <p className="text-xs text-gray-600">
            <span className="font-bold text-gray-900">{total - taken}</span> disponibles
          </p>
        </div>
      </div>

      <div className="absolute top-4 right-4 bg-blue-100 text-blue-600 px-2 py-1 rounded uppercase text-xs font-bold">198 au total</div>
    </div>
  );
}
