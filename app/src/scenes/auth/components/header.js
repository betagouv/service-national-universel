import React from "react";

export default function Header() {
  return (
    <nav className="sticky w-full bg-white flex items-center justify-between shadow-2xl top-0 left-0 z-20 p-6">
      {/* Logo */}
      <div className="flex items-center	">
        <div className="hidden md:block">
          <a href="https://www.snu.gouv.fr/">
            <img className="align-top	mr-20	h-20" src={require("../../../assets/fr.png")} />
          </a>
        </div>
        <a href="https://www.snu.gouv.fr/">
          <img className="align-top	mr-2 md:mr-20 h-10 sm:h-10 md:h-20" src={require("../../../assets/logo-snu.png")} />
        </a>
      </div>
      <div className=" flex-col	self-stretch justify-between items-end ">
        <h1 className="text-[#151d2f] text-[1rem] md:text-[2rem] font-bold text-right">Connexion à votre espace</h1>
        <h3 className="text-[#6a7181] text-[0.8rem] md:text-[1.5rem]">Suivez les étapes de votre parcours SNU</h3>
      </div>
    </nav>
  );
}
