import React from "react";
import arrowRightBlue from "../../../assets/arrowRightBlue.svg";
import humanCooperation from "../../../assets/humanCooperation.svg";
import { appURL } from "../../../config";

export default function Help() {
  return (
    <a href={`${appURL}/besoin-d-aide?from=/`} target="_blank" rel="noreferrer" className="hover:text-[#161616]">
      <div className="bg-[#F9F6F2] px-4 pt-4 pb-12 text-[#161616] md:hidden">
        <div className="flex justify-end">
          <img src={humanCooperation} alt="" />
        </div>
        <img src={arrowRightBlue} className="mb-2" />
        <div>
          <p className="text-lg font-bold my-2">Besoin d&apos;aide ?</p>
          <p className="text-sm">Consultez notre base de connaissance ou contactez notre équipe support</p>
        </div>
      </div>

      <div className="w-[50rem] bg-white mx-auto my-8 p-4 shadow-sm hidden md:flex text-[#161616] justify-between items-center">
        <img src={arrowRightBlue} className="w-4 h-4 md:hidden" />
        <div className="flex items-center gap-2">
          <img src={humanCooperation} alt="" className="w-20 h-20 hidden md:block" />
          <div>
            <p className="text-lg font-bold">Besoin d&apos;aide ?</p>
            <p className="text-sm">Consultez notre base de connaissance ou contactez notre équipe support</p>
          </div>
        </div>
        <img src={arrowRightBlue} className="w-6 h-6 mr-8" />
      </div>
    </a>
  );
}
