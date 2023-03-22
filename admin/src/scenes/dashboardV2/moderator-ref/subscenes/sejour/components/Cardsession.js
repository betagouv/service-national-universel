import React from "react";

export default function Cardsession() {
  return (
    <div className="relative flex flex-col gap-2 bg-white w-full rounded-lg px-6 py-4 shadow-[0_8px_16px_rgba(0,0,0,0.05)] h-[102px]">
      <p className="text-base leading-5 font-bold text-gray-900">Sessions validées</p>
      <p className="text-2xl leading-7 font-bold text-gray-900">1</p>
      <div className="absolute top-4 right-4 bg-blue-100 text-blue-600 px-2 py-1 rounded uppercase text-xs font-bold">3 en attente</div>
    </div>
  );
}
