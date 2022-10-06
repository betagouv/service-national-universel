import React from "react";
import useDevice from "../../../hooks/useDevice";
import save from "../../../assets/save.svg";

const Navbar = ({ step, onSave }) => {
  const desktop = useDevice() === "desktop";
  return ["COORDONNEES", "CONSENTEMENTS", "REPRESENTANTS", "DOCUMENTS"].includes(step) ? (
    <div className="bg-[#f9f6f2] px-3 py-3  text-[#161616] w-full">
      <div className={`flex flex-col justify-center ${desktop && "w-1/2 mx-auto my-0"}`}>
        <div className="flex justify-between">
          <div>
            <div className="text-sm">
              Étape {step === "COORDONNEES" ? "1" : step === "CONSENTEMENTS" ? "2" : step === "REPRESENTANTS" ? "3" : step === "DOCUMENTS" && "4"} sur 4
            </div>
            <div className="text-lg font-bold mt-2">
              {step === "COORDONNEES"
                ? "Dites-nous en plus sur vous"
                : step === "CONSENTEMENTS"
                ? "Consentement"
                : step === "REPRESENTANTS"
                ? "Mes représentants légaux"
                : step === "DOCUMENTS" && "Justifier de mon identité"}
            </div>
          </div>
          <img src={save} onClick={onSave} className="cursor-pointer" />
        </div>

        <div className="flex space-x-2 w-full mt-2">
          <div className="basis-1/3 bg-[#000091] h-2"></div>
          <div className={`basis-1/3  h-2 ${step !== "COORDONNEES" ? "bg-[#000091]" : "bg-[#C6C6FB]"}`}></div>
          <div className={`basis-1/3  h-2 ${["REPRESENTANTS", "DOCUMENTS"].includes(step) ? "bg-[#000091]" : "bg-[#C6C6FB]"}`}></div>
          <div className={`basis-1/3  h-2 ${step === "DOCUMENTS" ? "bg-[#000091]" : "bg-[#C6C6FB]"}`}></div>
        </div>
        {desktop && (
          <div className="flex space-x-1 text-xs mt-2 text-[#666666]">
            <div className="font-bold">{["COORDONNEES", "CONSENTEMENTS", "REPRESENTANTS"].includes(step) && "Étape suivante:"}</div>
            <div>
              {step === "COORDONNEES" ? "Consentement" : step === "CONSENTEMENTS" ? "Mes représentants légaux" : step === "REPRESENTANTS" ? "Justifier de mon identité" : null}
            </div>
          </div>
        )}
      </div>
    </div>
  ) : null;
};

export default Navbar;
