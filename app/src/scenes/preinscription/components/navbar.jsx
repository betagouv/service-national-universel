import React from "react";
import { useParams } from "react-router-dom";

import useDevice from "../../../hooks/useDevice";
import { getStepFromUrlParam, PREINSCRIPTION_STEPS_LIST } from "../../../utils/navigation";

const Navbar = () => {
  const { step } = useParams();
  // const currentStep = getStepFromUrlParam(step, PREINSCRIPTION_STEPS_LIST) || "ELIGIBILITE";
  const currentStep = getStepFromUrlParam(step, PREINSCRIPTION_STEPS_LIST);

  return ["ELIGIBILITE", "SEJOUR", "PROFIL"].includes(currentStep) ? (
    <div className="mx-auto flex w-full flex-col justify-center px-[1rem] py-[1rem] md:w-[56rem] md:px-[6rem] md:py-[2rem]">
      <div className="text-sm">Étape {currentStep === "ELIGIBILITE" ? "1" : currentStep === "SEJOUR" ? "2" : currentStep === "PROFIL" && "3"} sur 3</div>
      <div className="mt-2 text-lg font-bold">
        {currentStep === "ELIGIBILITE" ? "Avant d'aller plus loin" : currentStep === "SEJOUR" ? "Séjour de cohésion" : currentStep === "PROFIL" && "Mon compte volontaire SNU"}
      </div>
      <div className="mt-2 flex w-full space-x-2">
        <div className="h-2 basis-1/3 bg-[#000091]"></div>
        <div className={`h-2  basis-1/3 ${currentStep !== "ELIGIBILITE" ? "bg-[#000091]" : "bg-[#C6C6FB]"}`}></div>
        <div className={`h-2  basis-1/3 ${currentStep === "PROFIL" ? "bg-[#000091]" : "bg-[#C6C6FB]"}`}></div>
      </div>
      {useDevice() === "desktop" && (
        <div className="mt-2 flex space-x-1 text-xs text-[#666666]">
          <div className="font-bold">{["ELIGIBILITE", "SEJOUR"].includes(currentStep) && "Étape suivante:"}</div>
          <div>{currentStep === "ELIGIBILITE" ? "Séjour de cohésion" : currentStep === "SEJOUR" ? "Mon compte volontaire SNU" : null}</div>
        </div>
      )}
    </div>
  ) : (
    <div className="m-4 hidden md:block" />
  );
};

export default Navbar;
