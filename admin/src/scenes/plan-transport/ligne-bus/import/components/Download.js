import React from "react";
import { BsDownload } from "react-icons/bs";
import { PlainButton } from "../../../components/Buttons";
import ExcelColor from "../../components/Icons/ExcelColor.png";

export default function Download({ nextStep }) {
  return (
    <>
      <div className="flex flex-col w-full rounded-xl bg-white mt-8 pt-12 pb-24 px-8 gap-6">
        <div className="text-xl leading-7 font-medium text-gray-900 text-center pb-4">Téléchargez le modèle vierge</div>
        <div className="flex pb-4">
          <div className="flex flex-col justify-center w-[45%] gap-4 pl-4">
            <div className="text-base leading-6 font-bold text-gray-900">Mode d’emploi</div>
            <ul className="list-disc text-gray-500 text-sm leading-6 ">
              <li>Téléchargez le modèle de plan de transport</li>
              <li>Renseignez-le en tenant compte du guide de remplissage</li>
              <li>Téléverser le plan de transport complété</li>
            </ul>
          </div>
          <div className="flex w-[10%] justify-center items-center">
            <div className="w-[1px] h-4/5 border-r-[1px] border-gray-300"></div>
          </div>
          <div className="flex flex-col w-[45%] gap-4 text-center justify-center items-center py-4">
            <img src={ExcelColor} alt="Excel" className="w-[99px]" />
            <button className="flex items-center gap-3 text-blue-700 bg-white border !border-blue-600 py-2 rounded-md px-4 font-medium text-sm hover:shadow">
              <BsDownload className="text-blue-600" />
              Télécharger le modèle
            </button>
          </div>
        </div>
      </div>
      <div className="flex justify-end mt-4">
        <PlainButton className="w-52" onClick={nextStep}>
          Suivant
        </PlainButton>
      </div>
    </>
  );
}
