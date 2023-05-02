import React from "react";
import { Link } from "react-router-dom";

export default function CardCenterCapacity({ nbCenter, capacity, redirect }) {
  return (
    <Link className="flex h-[102px] w-full rounded-lg bg-white px-6 py-4 shadow-[0_8px_16px_rgba(0,0,0,0.05)]" to={redirect} target="_blank">
      <div className="flex w-[45%] flex-col gap-2">
        <p className="text-base font-bold leading-5 text-gray-900">Centres</p>
        <p className="text-2xl font-bold leading-7 text-gray-900">{nbCenter}</p>
      </div>
      <div className="flex w-[10%] items-center">
        <div className="h-4/5 w-[1px] border-l-[1px] border-gray-300"></div>
      </div>
      <div className="flex w-[45%] flex-col justify-center gap-2">
        <p className="text-base font-bold leading-5 text-gray-900">Capacité d’accueil</p>
        <p className="text-2xl font-bold leading-7 text-gray-900">{capacity}</p>
      </div>
    </Link>
  );
}
