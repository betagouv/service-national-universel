import React from "react";
import { AiOutlineExclamationCircle } from "react-icons/ai";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

import { redirectToCorrection, translateField, translateCorrectionReason } from "snu-lib";

export default function WaitingCorrectionV2() {
  const young = useSelector((state) => state.Auth.young);
  const history = useHistory();

  return (
    <>
      {/* DESKTOP */}
      <div className="hidden lg:flex">
        <div className="my-12 mx-10 w-full">
          <div className="flex justify-between items-stretch rounded-lg bg-white">
            <div className="w-1/2 pl-10 py-6">
              <div className="text-[44px] font-medium leading-tight tracking-tight text-gray-800">
                <strong>{young.firstName},</strong> bienvenue sur votre compte volontaire.
              </div>
              <div className="text-[#242526] font-bold text-xl mt-3">Votre dossier d’inscription est en attente de correction.</div>
              <div className="text-[#738297] text-sm mt-2">Merci d’effectuer les modifications demandées par votre référent :</div>
              <div className="flex flex-col gap-5 mt-3 overflow-auto max-h-[250px]">
                <hr className="border-gray-200" />
                {young.correctionRequests.map((correction, i) => (
                  <>
                    <div key={i} className="flex items-center justify-between gap-4 pr-2">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <AiOutlineExclamationCircle className="text-red-500 font-bold" />
                          <div className="text-red-500 font-bold text-sm">{translateField(correction.field)}</div>
                        </div>
                        {correction?.reason ? <div className="text-gray-900 text-base font-medium">Motif : {translateCorrectionReason(correction.reason)}</div> : null}
                        <div className="text-sm text-gray-600 font-normal">{correction.message}</div>
                      </div>
                      <button
                        className="text-blue-600 font-medium border-[1px] border-blue-600 px-2 py-2 text-sm hover:text-white hover:bg-blue-600 rounded-lg"
                        onClick={() => history.push(redirectToCorrection(correction.field))}>
                        Corriger
                      </button>
                    </div>
                    <hr className="border-gray-200" />
                  </>
                ))}
              </div>
            </div>
            <img className="w-1/2 object-fill" src={require("../../assets/homePhase2Desktop.png")} />
          </div>
        </div>
      </div>
      {/* MOBILE */}
      <div className="flex lg:hidden w-full">
        <div className="flex flex-col-reverse ">
          <div className="px-4 pb-4">
            <div className="text-3xl font-medium leading-tight tracking-tight text-gray-800">
              <strong>{young.firstName},</strong> bienvenue sur votre compte volontaire.
            </div>
            <div className="text-[#242526] font-bold text-base mt-3">Votre dossier d’inscription est en attente de correction.</div>
            <div className="text-[#738297] text-sm mt-2">Merci d’effectuer les modifications demandées par votre référent :</div>
            <div className="flex flex-col gap-5 mt-3">
              <hr className="border-gray-200" />
              {young.correctionRequests.map((correction, i) => (
                <>
                  <div key={i} className="flex flex-col gap-4 ">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <AiOutlineExclamationCircle className="text-red-500 font-bold" />
                        <div className="text-red-500 font-bold text-sm">{translateField(correction.field)}</div>
                      </div>
                      {correction?.reason ? <div className="text-gray-900 text-base font-medium">Motif : {translateCorrectionReason(correction.reason)}</div> : null}
                      <div className="text-sm text-gray-600 font-normal">{correction.message}</div>
                    </div>
                    <button
                      className="text-blue-600 font-medium border-[1px] border-blue-600 px-2 py-2 text-sm hover:text-white hover:bg-blue-600 rounded-lg"
                      onClick={() => history.push(redirectToCorrection(correction.field))}>
                      Corriger
                    </button>
                  </div>
                  <hr className="border-gray-200" />
                </>
              ))}
            </div>
          </div>
          <img src={require("../../assets/homePhase2Mobile.png")} />
        </div>
      </div>
    </>
  );
}
