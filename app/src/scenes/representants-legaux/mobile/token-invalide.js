import React from "react";
import logo from "../../../assets/logo-snu.png";

export default function TokenInvalide() {
  return (
    <div className="h-100 m-6 flex flex-col items-center justify-center">
      <img src={logo} alt="logo" className="w-56 pb-8" />
      <div className="pb-4 text-center text-3xl">Vous n&apos;avez pas les droits d&apos;accès à cette page !</div>
      <div className="mt-4 text-center text-lg text-gray-500">
        Besoin d&apos;aide&nbsp;?{" "}
        <a rel="noreferrer" href="/public-besoin-d-aide" target="_blank" className="scale-105 cursor-pointer hover:underline">
          Cliquez ici
        </a>
      </div>
    </div>
  );
}
