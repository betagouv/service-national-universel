import React from "react";
import { GoTools } from "react-icons/go";

export default function HeaderComponent() {
  return (
    <nav className="sticky w-full bg-white flex items-center justify-between shadow-2xl top-0 left-0 z-20 p-6">
      {/* Logo */}
      <div className="flex items-center	">
        <div className="hidden md:block">
          <a href="https://www.snu.gouv.fr/">
            <img className="align-top	mr-20	h-20" src={require("../../assets/fr.png")} />
          </a>
        </div>
        <a href="https://www.snu.gouv.fr/">
          <img className="align-top	mr-20 h-10 sm:h-10 md:h-20" src={require("../../assets/logo-snu.png")} />
        </a>
      </div>
      <div className="bg-yellow-50 p-3 rounded-lg shadow-sm ">
        <div className="flex space-x-2 items-center ">
          <GoTools className="text-yellow-600 text-base" />
          <h5 className="text-yellow-600 text-base">MAINTENANCE</h5>
        </div>
      </div>
    </nav>
  );
}
