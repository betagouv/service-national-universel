import React from "react";
import useDevice from "../../../hooks/useDevice";
import save from "../../../assets/save.svg";
import { useParams } from "react-router-dom";
import { getStepFromUrlParam, INSCRIPTION_STEPS_LIST } from "../../../utils/navigation";
import useAuth from "@/services/useAuth";
import { YOUNG_SOURCE } from "snu-lib";

const getIndex = (step, source) => {
  if (source === YOUNG_SOURCE.CLE) {
    return {
      COORDONNEES: "1",
      CONSENTEMENTS: "2",
      REPRESENTANTS: "3",
    }[step];
  }
  return {
    COORDONNEES: "1",
    CONSENTEMENTS: "2",
    REPRESENTANTS: "3",
    DOCUMENTS: "4",
    UPLOAD: "4",
  }[step];
};

const getWording = (step, source) => {
  if (source === YOUNG_SOURCE.CLE) {
    return {
      COORDONNEES: "Dites-nous en plus sur vous",
      CONSENTEMENTS: "Consentements",
      REPRESENTANTS: "Mes représentants légaux",
    }[step];
  }
  return {
    COORDONNEES: "Dites-nous en plus sur vous",
    CONSENTEMENTS: "Consentements",
    REPRESENTANTS: "Mes représentants légaux",
    DOCUMENTS: "Justifier de mon identité",
    UPLOAD: "Justifier de mon identité",
  }[step];
};

const getNext = (step, source) => {
  if (source === YOUNG_SOURCE.CLE) {
    return {
      COORDONNEES: "Consentement",
      CONSENTEMENTS: "Mes représentants légaux",
    }[step];
  }
  return {
    COORDONNEES: "Consentement",
    CONSENTEMENTS: "Mes représentants légaux",
    REPRESENTANTS: "Justifier de mon identité",
  }[step];
};

const getNextStepLabel = (currentStep, isCle) => {
  const nextStepLabels = isCle
    ? { COORDONNEES: "Consentement", CONSENTEMENTS: "Mes représentants légaux" }
    : { COORDONNEES: "Consentement", CONSENTEMENTS: "Mes représentants légaux", REPRESENTANTS: "Justifier de mon identité" };

  return nextStepLabels[currentStep];
};

const Navbar = ({ onSave }) => {
  const desktop = useDevice() === "desktop";
  const { young } = useAuth();
  const { step } = useParams();
  const isCle = YOUNG_SOURCE.CLE === young.source;
  const currentStep = getStepFromUrlParam(step, INSCRIPTION_STEPS_LIST, true);
  const stepIndex = getIndex(currentStep, young.source);
  const stepWording = getWording(currentStep, young.source);
  const nextStep = getNext(currentStep, young.source);
  const totalSteps = isCle ? 3 : 4;

  return (
    <div className="w-full bg-[#f9f6f2] px-3 text-[#161616] py-[1rem] md:pt-[2rem] md:pb-[0rem]">
      <div className="flex flex-col justify-center md:mx-auto md:my-0 md:w-1/2">
        <div className="flex justify-between">
          <div>
            <div className="text-sm">
              Étape {stepIndex} sur {totalSteps}
            </div>
            <div className="mt-2 text-lg font-bold">{stepWording}</div>
          </div>
          {onSave && <img src={save} onClick={onSave} className="cursor-pointer" />}
        </div>

        <div className="mt-2 flex w-full space-x-2">
          <div className="h-2 basis-1/3 bg-[#000091]"></div>
          <div className={`h-2  basis-1/3 ${currentStep !== "COORDONNEES" ? "bg-[#000091]" : "bg-[#C6C6FB]"}`}></div>
          {isCle ? (
            <>
              <div className={`h-2  basis-1/3 ${["REPRESENTANTS"].includes(currentStep) ? "bg-[#000091]" : "bg-[#C6C6FB]"}`}></div>
            </>
          ) : (
            <>
              <div className={`h-2  basis-1/3 ${["REPRESENTANTS", "DOCUMENTS", "UPLOAD"].includes(currentStep) ? "bg-[#000091]" : "bg-[#C6C6FB]"}`}></div>
              <div className={`h-2  basis-1/3 ${["DOCUMENTS", "UPLOAD"].includes(currentStep) ? "bg-[#000091]" : "bg-[#C6C6FB]"}`}></div>
            </>
          )}
        </div>
        {/* {desktop && (
          <div className="mt-2 flex space-x-1 text-xs text-[#666666]">
            {isCle ? (
              <div>
                <div className="font-bold">{["COORDONNEES", "CONSENTEMENTS"].includes(currentStep) && "Étape suivante:"}</div>
                <div>{nextStep}</div>
              </div>
            ) : (
              <div>
                <div className="font-bold">{["COORDONNEES", "CONSENTEMENTS", "REPRESENTANTS"].includes(currentStep) && "Étape suivante:"}</div>
                <div>{nextStep}</div>
              </div>
            )}
          </div>
        )} */}
        {desktop && (
          <div className="mt-2 flex space-x-1 text-xs text-[#666666]">
            <div className="font-bold">{getNextStepLabel(currentStep, isCle) && "Étape suivante:"}</div>
            <div>{nextStep}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
