import React from "react";
import useDevice from "../../../hooks/useDevice";
import save from "../../../assets/save.svg";
import { useParams } from "react-router-dom";
import { getStepFromUrlParam } from "../utils/navigation";

const index = {
  ELIGIBILITE: "1",
  SEJOUR: "2",
  DOCUMENTS: "3",
  UPLOAD: "3",
};

const wording = {
  ELIGIBILITE: "Avant d'aller plus loin",
  SEJOUR: "Séjour de cohésion",
  DOCUMENTS: "Justifier de mon identité",
  UPLOAD: "Justifier de mon identité",
};

const next = {
  ELIGIBILITE: "Séjour de cohésion",
  SEJOUR: "Justifier de mon identité",
};

const Navbar = ({ onSave }) => {
  const desktop = useDevice() === "desktop";

  const { step } = useParams();
  const currentStep = getStepFromUrlParam(step);

  return (
    <div className="bg-[#f9f6f2] px-3 py-3  text-[#161616] w-full">
      <div className={`flex flex-col justify-center ${desktop && "w-1/2 mx-auto my-0"}`}>
        <div className="flex justify-between">
          <div>
            <div className="text-sm">Étape {index[currentStep]} sur 3</div>
            <div className="text-lg font-bold mt-2">{wording[currentStep]}</div>
          </div>
          {onSave && <img src={save} onClick={onSave} className="cursor-pointer" />}
        </div>

        <div className="flex space-x-2 w-full mt-2">
          <div className="basis-1/3 bg-[#000091] h-2"></div>
          <div className={`basis-1/3  h-2 ${currentStep !== "ELIGIBILITE" ? "bg-[#000091]" : "bg-[#C6C6FB]"}`}></div>
          <div className={`basis-1/3  h-2 ${["DOCUMENTS", "UPLOAD"].includes(currentStep) ? "bg-[#000091]" : "bg-[#C6C6FB]"}`}></div>
        </div>
        {desktop && (
          <div className="flex space-x-1 text-xs mt-2 text-[#666666]">
            <div className="font-bold">{["COORDONNEES", "SEJOUR"].includes(currentStep) && "Étape suivante:"}</div>
            <div>{next[currentStep]}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
