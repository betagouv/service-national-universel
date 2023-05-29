import React from "react";
import { BsDownload } from "react-icons/bs";
import { PlainButton } from "../../../components/Buttons";
import ExcelColor from "../../components/Icons/ExcelColor.png";
import { CDN_BASE_URL } from "../../../../../utils";

export default function Download({ nextStep }) {
  return (
    <>
      <div className="mt-8 flex w-full flex-col gap-6 rounded-xl bg-white px-8 pt-12 pb-24">
        <div className="pb-4 text-center text-xl font-medium leading-7 text-gray-900">Téléchargez le modèle vierge</div>
        <div className="flex pb-4">
          <div className="flex w-[45%] flex-col justify-center gap-4 pl-4">
            <div className="text-base font-bold leading-6 text-gray-900">Mode d’emploi</div>
            <ul className="list-disc text-sm leading-6 text-gray-500 ">
              <li>Téléchargez le modèle de plan de transport</li>
              <li>Renseignez-le en tenant compte du guide de remplissage</li>
              <li>Téléverser le plan de transport complété</li>
            </ul>
          </div>
          <div className="flex w-[10%] items-center justify-center">
            <div className="h-4/5 w-[1px] border-r-[1px] border-gray-300"></div>
          </div>
          <div className="flex w-[45%] flex-col items-center justify-center gap-4 py-4 text-center">
            <img src={ExcelColor} alt="Excel" className="w-[99px]" />
            <a
              className="flex items-center gap-3 rounded-md border !border-blue-600 bg-white py-2 px-4 text-sm font-medium text-blue-700 hover:shadow"
              href={`${CDN_BASE_URL}/file/snu-plan-de-transport-model.xlsx`}>
              <BsDownload className="text-blue-600" />
              Télécharger le modèle
            </a>
          </div>
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <PlainButton className="w-52" onClick={nextStep}>
          Suivant
        </PlainButton>
      </div>
    </>
  );
}
