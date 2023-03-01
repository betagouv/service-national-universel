import React from "react";
import logo from "../../../assets/logo-snu.png";

export default function TokenInvalide() {
  return (
    <div className="flex flex-col h-100 items-center justify-center m-6">
      <img src={logo} alt="logo" className="w-56 pb-8" />
      <div className="text-3xl text-center pb-4">Vous n&apos;avez pas les droits d&apos;accès à cette page !</div>
      <div className="text-center text-lg mt-4 text-gray-500">
        Besoin d&apos;aide&nbsp;?{" "}
        <a rel="noreferrer" href="/public-besoin-d-aide" target="_blank" className="hover:underline scale-105 cursor-pointer">
          Cliquez ici
        </a>
      </div>
    </div>
  );
}
