import React from "react";
import { PlainButton } from "../../../components/Buttons";
import ExcelColor from "../../components/Icons/ExcelColor.png";
import ReactLoading from "react-loading";
import { HiOutlineChevronDown } from "react-icons/hi";
import { GrCircleInformation } from "react-icons/gr";
import ReactTooltip from "react-tooltip";

export default function Import({ nextStep }) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);
  const fileInputRef = React.useRef(null);

  const handleClickUpload = () => {
    fileInputRef.current.click();
  };

  return hasError ? (
    <>
      <div className="flex flex-col w-full rounded-xl bg-white mt-8 pt-12 pb-24 px-8 gap-6">
        <div className="text-xl leading-7 font-medium text-gray-900 text-center pb-4">Import du fichier</div>
        <div className="flex flex-col items-center justify-center gap-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <img src={ExcelColor} alt="Excel" className="w-[56px]" />
              <div className="flex flex-col">
                <div className="text-sm leading-5 text-gray-900">plan_transport_2023.xlsx</div>
                <div className="text-xs leading-5 text-gray-500">13 erreurs détectées</div>
              </div>
            </div>
            <button
              className="flex items-center gap-3 text-blue-700 bg-white border !border-blue-600 py-2 rounded-md px-4 font-medium text-sm hover:shadow"
              onClick={() => {
                setIsLoading(false);
                setHasError(false);
              }}>
              Importer un nouveau fichier
            </button>
          </div>
          <ErrorBlock />
          <ErrorBlock />
        </div>
      </div>
      <div className="flex justify-end mt-4">
        <PlainButton className="w-52" disabled>
          Suivant
        </PlainButton>
      </div>
    </>
  ) : (
    <>
      <div className="flex flex-col w-full rounded-xl bg-white mt-8 pt-12 pb-24 px-8 gap-6 justify-center items-center">
        <div className="text-xl leading-7 font-medium text-gray-900 text-center pb-4">Import du fichier</div>
        <div className="flex flex-col items-center justify-center w-[641px] h-[218px] border-[1px] border-dashed border-gray-300 rounded-lg gap-2">
          <img src={ExcelColor} alt="Excel" className="w-[71px]" />
          {!isLoading ? (
            <>
              <input type="file" className="hidden" ref={fileInputRef} />
              <div onClick={handleClickUpload} className="text-sm leading-5 font-medium text-blue-600 text-center hover:underline cursor-pointer">
                Téléversez votre fichier
              </div>
              <div className="text-xs leading-4 font-normal text-gray-500">XLS jusqu’à 5Mo</div>
            </>
          ) : (
            <ReactLoading className="mt-2" type="spin" color="#2563EB" width={"40px"} height={"40px"} />
          )}
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

const ErrorBlock = () => {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <div className="flex flex-col w-[700px]">
        <button className={`flex items-center justify-between bg-[#EA5946] rounded-t-lg ${open ? "" : "rounded-b-lg"} px-4 h-[56px]`} onClick={() => setOpen(!open)}>
          <div className="flex gap-10 items-center">
            <div className="text-sm leading-5 font-bold text-white">7 erreurs - Points de rassemblement</div>
            <div className="text-xs leading-5 font-normal text-white">Colonne H</div>
          </div>
          <HiOutlineChevronDown className={`text-white h-5 w-5 ${open ? "transform rotate-180" : ""}`} />
        </button>

        <div className={`${open ? "block" : "hidden "} border-b-[1px] border-r-[1px] border-l-[1px] rounded-b-lg border-gray-200 w-full`}>
          {Array.from({ length: 10 }, (_, i) => i + 1).map((item, index) => (
            <>
              {index !== 0 && <hr className="border-gray-200" />}
              <div key={index} className="flex items-center justify-between px-4 py-2 w-full">
                <div className="text-sm leading-5 font-medium text-gray-800">Ligne 1</div>
                <div className="flex items-center gap-4 w-1/4">
                  <div className="text-sm leading-5 font-normal text-gray-800">Format inconnu</div>
                  <GrCircleInformation data-tip data-for="info" className="text-gray-500 h-3 w-3 cursor-pointer" />
                  <ReactTooltip id="info" className="rounded-lg bg-white drop-shadow-sm" arrowColor="white" place="top">
                    <div className="text-[#414458] text-xs">Donner un avis favorable</div>
                  </ReactTooltip>
                </div>
              </div>
            </>
          ))}
        </div>
      </div>
    </>
  );
};
