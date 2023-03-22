import React from "react";

function CardCenterCapacity() {
  return (
    <div className="flex bg-white w-full rounded-lg px-6 py-4 shadow-[0_8px_16px_rgba(0,0,0,0.05)] h-[102px]">
      <div className="flex flex-col gap-2 w-[45%]">
        <p className="text-base leading-5 font-bold text-gray-900">Centres</p>
        <p className="text-2xl leading-7 font-bold text-gray-900">7</p>
      </div>
      <div className="flex items-center w-[10%]">
        <div className="w-[1px] h-4/5 border-l-[1px] border-gray-300"></div>
      </div>
      <div className="flex flex-col gap-2 w-[45%] justify-center">
        <p className="text-base leading-5 font-bold text-gray-900">Capacité d’accueil</p>
        <p className="text-2xl leading-7 font-bold text-gray-900">231</p>
      </div>
    </div>
  );
}

export default CardCenterCapacity;
