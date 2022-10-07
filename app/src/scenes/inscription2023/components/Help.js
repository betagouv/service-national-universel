import React from "react";
import arrowRightBlue from "../../../assets/arrowRightBlue.svg";
import humanCoorperation from "../../../assets/humanCooperation.svg";
import { appURL } from "../../../config";

const Help = () => {
  return (
    <div className="bg-[#F9F6F2] px-4 pt-4 pb-12 text-[#161616]">
      <div className="flex justify-end">
        <img src={humanCoorperation} alt="" />
      </div>
      <a href={`${appURL}/base-de-connaissance/`} target="_blank" rel="noreferrer" className="hover:text-[#161616]">
        <img src={arrowRightBlue} className="mb-2" />
        <div className="text-lg mb-2">Besoin d&apos;aide ?</div>
        <div className="text-sm">Consultez notre base de connaissance ou contactez notre équipe support</div>
      </a>
    </div>
  );
};

export default Help;
