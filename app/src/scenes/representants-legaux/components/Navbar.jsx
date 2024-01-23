import React from "react";
import useDevice from "../../../hooks/useDevice";

const index = {
  PRESENTATION: "1",
  VERIFICATION: "2",
  CONSENTEMENT: "3",
  PRESENTATION_PARENT2: "1",
  VERIFICATION_PARENT2: "2",
  CONSENTEMENT_PARENT2: "3",
};

const wording = {
  PRESENTATION: "Présentation",
  VERIFICATION: "Vérification des informations renseignées",
  CONSENTEMENT: "Mon consentement",
  PRESENTATION_PARENT2: "Présentation",
  VERIFICATION_PARENT2: "Vérification des informations renseignées",
  CONSENTEMENT_PARENT2: "Mon consentement",
};

const next = {
  PRESENTATION: "Vérification des informations renseignées",
  VERIFICATION: "Mon consentement",
  CONSENTEMENT: null,
  PRESENTATION_PARENT2: "Vérification des informations renseignées",
  VERIFICATION_PARENT2: "Mon consentement",
  CONSENTEMENT_PARENT2: null,
};

const Navbar = ({ step }) => {
  const desktop = useDevice() === "desktop";
  return (
    <div className="w-full bg-[#f9f6f2] px-3  py-[1rem] md:pt-[2rem] md:pb-[0rem] text-[#161616]">
      <div className={`flex flex-col justify-center ${desktop && "mx-auto my-0 w-1/2"}`}>
        <div className="flex justify-between">
          <div>
            <div className="text-sm">Étape {index[step]} sur 3</div>
            <div className="mt-2 text-lg font-bold">{wording[step]}</div>
          </div>
        </div>

        <div className="mt-2 flex w-full space-x-2">
          <div className="h-2 basis-1/3 bg-[#000091]"></div>
          <div className={`h-2  basis-1/3 ${step !== "PRESENTATION" && step !== "PRESENTATION_PARENT2" ? "bg-[#000091]" : "bg-[#C6C6FB]"}`}></div>
          <div className={`h-2  basis-1/3 ${["CONSENTEMENT", "CONSENTEMENT_PARENT2", "DOCUMENTS"].includes(step) ? "bg-[#000091]" : "bg-[#C6C6FB]"}`}></div>
        </div>
        {desktop && (
          <div className="mt-2 flex space-x-1 text-xs text-[#666666]">
            <div className="font-bold">{["PRESENTATION", "PRESENTATION_PARENT2", "VERIFICATION", "VERIFICATION_PARENT2"].includes(step) && "Étape suivante:"}</div>
            <div>{next[step]}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
