import React from "react";
import { useParams } from "react-router-dom";

import useDevice from "../../../hooks/useDevice";
import { getStepFromUrlParam, REINSCRIPTION_STEPS_LIST } from "../../../utils/navigation";

const ProgressBar = () => {
  let { step } = useParams();
  if (!step){
    step = "eligibilite"
  }
  const currentStep = getStepFromUrlParam(step, REINSCRIPTION_STEPS_LIST);
  const device = useDevice();
  return ["ELIGIBILITE", "SEJOUR"].includes(currentStep) ? (
    <div className="mx-auto flex w-full flex-col justify-center px-[1rem] py-[1rem] md:w-[56rem] md:px-[6rem] md:pt-[2rem] md:pb-[0rem]">
      <div className="text-sm">Étape {currentStep === "ELIGIBILITE" ? "1" : "2"} sur 2</div>
      <div className="mt-2 text-lg font-bold">
        {currentStep === "ELIGIBILITE" ? "Avant d'aller plus loin" : "Séjour de cohésion"}
      </div>
      <div className="mt-2 flex w-full space-x-2">
        <div className={`h-2 basis-1/2 ${currentStep === "ELIGIBILITE" ? "bg-[#000091]" : "bg-[#C6C6FB]"}`}></div>
        <div className={`h-2 basis-1/2 ${currentStep === "SEJOUR" ? "bg-[#000091]" : "bg-[#C6C6FB]"}`}></div>
      </div>
      {device === "desktop" && (
        <div className="mt-2 flex space-x-1 text-xs text-[#666666]">
          <div className="font-bold">{currentStep === "ELIGIBILITE" && "Étape suivante:"}</div>
          <div>{currentStep === "ELIGIBILITE" ? "Séjour de cohésion" : null}</div>
        </div>
      )}
    </div>
  ) : (
    <div className="m-4 hidden md:block" />
  );
};

export default ProgressBar;
