import React from "react";
import arrowRightBlue from "../../../assets/arrowRightBlue.svg";
import humanCoorperation from "../../../assets/humanCooperation.svg";
import { appURL } from "../../../config";
import useDevice from "../../../hooks/useDevice";

const Help = () => {
  // const mobile = useDevice() === "mobile";
  return (
    <>
      <div className="bg-[#F9F6F2] px-4 pt-4 pb-12 text-[#161616] md:hidden">
        <div className="flex justify-end">
          <img src={humanCoorperation} alt="" />
        </div>
        <a href={`${appURL}/besoin-d-aide?from=/`} target="_blank" rel="noreferrer" className="hover:text-[#161616]">
          <img src={arrowRightBlue} className="mb-2" />
          <div className="text-lg mb-2">Besoin d&apos;aide ?</div>
          <div className="text-sm">Consultez notre base de connaissance ou contactez notre équipe support</div>
        </a>
      </div>

      {/* <div className="w-[50rem] drop-shadow bg-white mx-auto my-8 p-4 hidden md:block text-[#161616] flex flex-row items-center justify-between cursor-pointer"> */}
      <div className="w-[50rem] drop-shadow bg-white mx-auto my-8 p-4 hidden md:block text-[#161616]">
        <img src={humanCoorperation} alt="" />
        <a href={`${appURL}/besoin-d-aide?from=/`} target="_blank" rel="noreferrer" className="hover:text-[#161616]">
          <div className="text-lg mb-2">Besoin d&apos;aide ?</div>
          <div className="text-sm">Consultez notre base de connaissance ou contactez notre équipe support</div>
        </a>
        <img src={arrowRightBlue} className="mb-2" />
      </div>
    </>
  );
};

export default Help;
