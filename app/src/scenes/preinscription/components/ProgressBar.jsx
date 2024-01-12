import React from "react";
import { useParams } from "react-router-dom";

import useDevice from "../../../hooks/useDevice";
import { getStepFromUrlParam, PREINSCRIPTION_STEPS_LIST, REINSCRIPTION_STEPS_LIST } from "../../../utils/navigation";

const ProgressBar = ({ isReinscription = false }) => {
  const STEPS_LIST = isReinscription ? REINSCRIPTION_STEPS_LIST : PREINSCRIPTION_STEPS_LIST;

  let { step } = useParams();
  if (!step) {
    step = "eligibilite";
  }
  const currentStep = getStepFromUrlParam(step, STEPS_LIST);
  const device = useDevice();
  const STEPS = isReinscription ? ["ELIGIBILITE", "SEJOUR"] : ["ELIGIBILITE", "SEJOUR", "PROFIL"];
  const NEXT_STEP = {
    ELIGIBILITE: "Séjour de cohésion",
    SEJOUR: !isReinscription && "Mon compte volontaire SNU",
  };

  return STEPS.includes(currentStep) ? (
    <div className="mx-auto flex w-full flex-col justify-center px-[1rem] py-[1rem] md:w-[56rem] md:px-[6rem] md:pt-[2rem] md:pb-[0rem]">
      <div className="text-sm">Étape {currentStep === "ELIGIBILITE" ? "1" : currentStep === "SEJOUR" ? "2" : currentStep === "PROFIL" && "3"} sur 3</div>
      <div className="mt-2 text-lg font-bold">
        {currentStep === "ELIGIBILITE" ? "Avant d'aller plus loin" : currentStep === "SEJOUR" ? "Séjour de cohésion" : currentStep === "PROFIL" && "Mon compte volontaire SNU"}
      </div>
      <div className="mt-2 flex w-full space-x-2">
        {STEPS.map((step) => (
          <div key={`step-${step}`} className={`h-2 basis-1/${STEPS.length} ${currentStep === step ? "bg-[#000091]" : "bg-[#C6C6FB]"}`}></div>
        ))}
      </div>
      {device === "desktop" && NEXT_STEP[currentStep] && (
        <div className="mt-2 flex space-x-1 text-xs text-[#666666]">
          <div className="font-bold">Étape suivante:</div>
          <div>{NEXT_STEP[currentStep]}</div>
        </div>
      )}
    </div>
  ) : (
    <div className="m-4 hidden md:block" />
  );
};

export default ProgressBar;
