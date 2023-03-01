import React from "react";
import logo from "../../../assets/logo-snu.png";

export default function Unauhthorized({ code }) {
  return (
    <div className="flex flex-col h-100 items-center justify-center m-6">
      <img src={logo} alt="logo" className="w-56 pb-8" />
      {code === "OPERATION_UNAUTHORIZED" ? (
        <div className="text-2xl text-center">Ce lien est actif à partir d’une semaine avant le départ du séjour de cohésion et expire un jour après la fin du séjour.</div>
      ) : (
        <div className="text-3xl text-center pb-4">Vous n'avez pas les droits d'accès à cette page !</div>
      )}
      <div className="text-center text-lg mt-4 text-gray-500">
        Besoin d'aide ?{" "}
        <a rel="noreferrer" href="/public-besoin-d-aide" target="_blank" className="hover:underline scale-105 cursor-pointer">
          Cliquez ici
        </a>
      </div>
    </div>
  );
}
