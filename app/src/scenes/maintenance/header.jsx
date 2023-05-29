import Img3 from "../../assets/fr.png";
import Img2 from "../../assets/logo-snu.png";
import React from "react";
import { GoTools } from "react-icons/go";

export default function HeaderComponent() {
  return (
    <nav className="sticky top-0 left-0 z-20 flex w-full items-center justify-between bg-white p-6 shadow-2xl">
      {/* Logo */}
      <div className="flex items-center	">
        <div className="hidden md:block">
          <a href="https://www.snu.gouv.fr/">
            <img className="mr-20	h-20	align-top" src={Img3} />
          </a>
        </div>
        <a href="https://www.snu.gouv.fr/">
          <img className="mr-20	h-10 align-top sm:h-10 md:h-20" src={Img2} />
        </a>
      </div>
      <div className="rounded-lg bg-yellow-50 p-3 shadow-sm ">
        <div className="flex items-center space-x-2 ">
          <GoTools className="text-base text-yellow-600" />
          <h5 className="text-base text-yellow-600">MAINTENANCE</h5>
        </div>
      </div>
    </nav>
  );
}
