import React from "react";
import useDevice from "../../../hooks/useDevice";
import save from "../../../assets/save.svg";
import { useParams } from "react-router-dom";
import { getStepFromUrlParam } from "../utils/navigation";

const index = {
  ELIGIBILITE: "1",
  SEJOUR: "2",
  CONSENTEMENTS: "3",
  DOCUMENTS: "4",
  UPLOAD: "4",
};

const wording = {
  ELIGIBILITE: "Avant d'aller plus loin",
  SEJOUR: "Séjour de cohésion",
  CONSENTEMENTS: "Consentements",
  DOCUMENTS: "Justifier de mon identité",
  UPLOAD: "Justifier de mon identité",
};

const next = {
  ELIGIBILITE: "Séjour de cohésion",
  SEJOUR: "Consentement",
  CONSENTEMENTS: "Justifier de mon identité",
};

const Navbar = ({ onSave }) => {
  const desktop = useDevice() === "desktop";

  const { step } = useParams();
  const currentStep = getStepFromUrlParam(step);

  return (
    <div className="w-full bg-[#f9f6f2] px-3  py-3 text-[#161616]">
      <div className={`flex flex-col justify-center ${desktop && "mx-auto my-0 w-1/2"}`}>
        <div className="flex justify-between">
          <div>
            <div className="text-sm">Étape {index[currentStep]} sur 4</div>
            <div className="mt-2 text-lg font-bold">{wording[currentStep]}</div>
          </div>
          {onSave && <img src={save} onClick={onSave} className="cursor-pointer" />}
        </div>

        <div className="mt-2 flex w-full space-x-2">
          <div className="h-2 basis-1/3 bg-[#000091]"></div>
          <div className={`h-2  basis-1/3 ${currentStep !== "ELIGIBILITE" ? "bg-[#000091]" : "bg-[#C6C6FB]"}`}></div>
          <div className={`h-2  basis-1/3 ${["CONSENTEMENTS", "DOCUMENTS", "UPLOAD"].includes(currentStep) ? "bg-[#000091]" : "bg-[#C6C6FB]"}`}></div>
          <div className={`h-2  basis-1/3 ${["DOCUMENTS", "UPLOAD"].includes(currentStep) ? "bg-[#000091]" : "bg-[#C6C6FB]"}`}></div>
        </div>
        {desktop && next?.[currentStep] && (
          <div className="mt-2 flex space-x-1 text-xs text-[#666666]">
            <div className="font-bold">Étape suivante:</div>
            <div>{next[currentStep]}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
