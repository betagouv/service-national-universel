import React from "react";
import logo from "../../../assets/logo-snu.png";

export default function Unauhthorized({ code }) {
  return (
    <div className="h-100 m-6 flex flex-col items-center justify-center">
      <img src={logo} alt="logo" className="w-56 pb-8" />
      {code === "OPERATION_UNAUTHORIZED" ? (
        <div className="text-center text-2xl">Ce lien est actif à partir d’une semaine avant le départ du séjour de cohésion et expire un jour après la fin du séjour.</div>
      ) : (
        <div className="pb-4 text-center text-3xl">Vous n'avez pas les droits d'accès à cette page !</div>
      )}
      <div className="mt-4 text-center text-lg text-gray-500">
        Besoin d'aide ?{" "}
        <a rel="noreferrer" href="/public-besoin-d-aide" target="_blank" className="scale-105 cursor-pointer hover:underline">
          Cliquez ici
        </a>
      </div>
    </div>
  );
}
