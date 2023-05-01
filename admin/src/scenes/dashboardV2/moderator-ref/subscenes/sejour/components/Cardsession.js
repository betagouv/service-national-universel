import React from "react";
import { Link } from "react-router-dom";

export default function Cardsession({ nbValidated, nbPending, redirect }) {
  return (
    <Link className="relative flex h-[102px] w-full flex-col gap-2 rounded-lg bg-white px-6 py-4 shadow-[0_8px_16px_rgba(0,0,0,0.05)]" to={redirect} target="_blank">
      <p className="text-base font-bold leading-5 text-gray-900">Sessions validées</p>
      <p className="text-2xl font-bold leading-7 text-gray-900">{nbValidated}</p>
      <div className="absolute top-4 right-4 rounded bg-blue-100 px-2 py-1 text-xs font-bold uppercase text-blue-600">{nbPending} en attente</div>
    </Link>
  );
}
