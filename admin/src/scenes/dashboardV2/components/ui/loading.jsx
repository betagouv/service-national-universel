import React from "react";

export function LoadingBar({ width }) {
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
}

export function LoadingDoughnut({ width }) {
  return (
    <div className={`flex animate-pulse space-x-4 ${width}`}>
      <div className="flex flex-1 items-center justify-center space-y-6">
        <div className="h-[64px] w-[64px] rounded-full border-8 border-gray-300"></div>
      </div>
    </div>
  );
}

export function LoadingDemiDoughnut({ width }) {
  return (
    <div className={`flex animate-pulse space-x-4 ${width}`}>
      <div className="flex flex-1 items-center justify-center space-y-6">
        <div className="h-[64px] w-[128px] rounded-t-full border-x-[16px] border-t-[16px] border-gray-300"></div>
      </div>
    </div>
  );
}
