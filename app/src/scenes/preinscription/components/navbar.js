import React from "react";
import useDevice from "../../../hooks/useDevice";

const Navbar = ({ step }) => {
  return (
    <div className="bg-[#f9f6f2] px-3 py-3  text-[#161616] w-full">
      <div className={`flex flex-col justify-center ${useDevice() === "desktop" && "w-1/3 mx-auto my-0"}`}>
        <div className="text-sm">Étape {step === "ELIGIBILITE" ? "1" : step === "SEJOUR" ? "2" : "3"} sur 3</div>
        <div className="text-lg font-bold mt-2">{step === "ELIGIBILITE" ? "Avant d'aller plus loin" : step === "SEJOUR" ? "Séjour de cohésion" : "Mon compte volontaire SNU"}</div>
        <div className="flex space-x-2 w-full mt-2">
          <div className="basis-1/3 bg-[#000091] h-2"></div>
          <div className={`basis-1/3  h-2 ${step !== "ELIGIBILITE" ? "bg-[#000091]" : "bg-[#C6C6FB]"}`}></div>
          <div className={`basis-1/3  h-2 ${step === "PROFIL" ? "bg-[#000091]" : "bg-[#C6C6FB]"}`}></div>
        </div>
        {useDevice() === "desktop" && (
          <div className="flex space-x-1 text-xs mt-2 text-[#666666]">
            <div className="font-bold">Étape suivante:</div>
            <div>{step === "ELIGIBILITE" ? "Séjour de cohésion" : step === "SEJOUR" ? "Mon compte volontaire SNU" : null}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
