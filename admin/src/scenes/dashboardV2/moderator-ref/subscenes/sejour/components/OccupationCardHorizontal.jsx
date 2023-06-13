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
    <div className="relative flex h-[102px] w-full flex-col gap-2 rounded-lg bg-white px-6 py-4 shadow-[0_8px_16px_rgba(0,0,0,0.05)]">
      <p className="text-base font-bold leading-5 text-gray-900">Places</p>
      <div className="">
        {Math.floor(occupationPercentage) === 0 ? (
          <div className="flex h-[6px] w-full flex-col items-center justify-center overflow-hidden rounded-full bg-gray-100" />
        ) : (
          <div className="flex h-[6px] flex-col justify-end overflow-hidden rounded-full bg-gray-100">
            <div className={`flex h-[6px] items-center justify-center ${width} ${bgColor} rounded-full`} />
          </div>
        )}
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="h-[7px] w-[7px] rounded-full bg-blue-700" />
          <p className="text-xs text-gray-600">
            <span className="font-bold text-gray-900">{taken}</span> occupées
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-[7px] w-[7px] rounded-full bg-gray-200" />
          <p className="text-xs text-gray-600">
            <span className="font-bold text-gray-900">{total - taken}</span> disponibles
          </p>
        </div>
      </div>

      <div className="absolute top-4 right-4 rounded bg-blue-100 px-2 py-1 text-xs font-bold uppercase text-blue-600">{total} au total</div>
    </div>
  );
}
