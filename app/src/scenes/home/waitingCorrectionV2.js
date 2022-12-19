import React from "react";
import { AiOutlineExclamationCircle } from "react-icons/ai";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

import { translateField, translateCorrectionReason, formatDateFR, PHASE1_YOUNG_ACCESS_LIMIT, translate } from "snu-lib";
import plausibleEvent from "../../services/plausible";
import { redirectToCorrection } from "../../utils/navigation";

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
              <div className="text-[#738297] text-sm mt-2">
                Merci d’effectuer <b>avant le {formatDateFR(PHASE1_YOUNG_ACCESS_LIMIT[young.cohort])} inclus</b> les modifications demandées par votre référent :
              </div>
              <div className="flex flex-col gap-5 mt-3 overflow-auto max-h-[250px]">
                <hr className="border-gray-200" />
                {young.correctionRequests.map((correction, i) => {
                  if (!["SENT", "REMINDED"].includes(correction.status)) return null;
                  return (
                    <>
                      <div key={i} className="flex items-center justify-between gap-4 pr-2">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <AiOutlineExclamationCircle className="text-red-500 font-bold" />
                            <div className="text-red-500 font-bold text-sm">{translateField(correction.field)}</div>
                          </div>
                          {correction?.reason ? <div className="text-gray-900 text-base font-medium">Motif : {translateCorrectionReason(correction.reason)}</div> : null}
                          {correction?.message ? <div className="text-sm text-gray-600 font-normal">{correction.message}</div> : null}
                        </div>
                        <button
                          className="text-blue-600 font-medium border-[1px] border-blue-600 px-2 py-2 text-sm hover:text-white hover:bg-blue-600 rounded-lg"
                          onClick={() => history.push(redirectToCorrection(correction.field))}>
                          Corriger
                        </button>
                      </div>
                      <hr className="border-gray-200" />
                    </>
                  );
                })}
              </div>
            </div>
            <img className="w-1/2 object-fill" src={require("../../assets/homePhase2Desktop.png")} />
          </div>
          <div className="flex justify-end mt-10">
            <a
              className="w-40"
              href="https://voxusagers.numerique.gouv.fr/Demarches/3154?&view-mode=formulaire-avis&nd_mode=en-ligne-enti%C3%A8rement&nd_source=button&key=060c41afff346d1b228c2c02d891931f"
              onClick={() => plausibleEvent("Compte/CTA - Je donne mon avis", { statut: translate(young.status) })}>
              <img src="https://voxusagers.numerique.gouv.fr/static/bouton-blanc.svg" alt="Je donne mon avis" />
            </a>
          </div>
        </div>
      </div>
      {/* MOBILE */}
      <div className="flex flex-col lg:hidden w-full">
        <div className="flex flex-col-reverse w-full">
          <div className="px-4 pb-4 flex-col w-full">
            <div className="text-3xl font-medium leading-tight tracking-tight text-gray-800">
              <strong>{young.firstName},</strong> bienvenue sur votre compte volontaire.
            </div>
            <div className="text-[#242526] font-bold text-base mt-3">Votre dossier d’inscription est en attente de correction.</div>
            <div className="text-[#738297] text-sm mt-2">
              Merci d’effectuer avant le <b>{formatDateFR(PHASE1_YOUNG_ACCESS_LIMIT[young.cohort])} inclus</b> les modifications demandées par votre référent :
            </div>
            <div className="flex flex-col gap-5 mt-3">
              <hr className="border-gray-200" />
              {young.correctionRequests.map((correction, i) => {
                if (!["SENT", "REMINDED"].includes(correction.status)) return null;
                return (
                  <>
                    <div key={i} className="flex flex-col gap-4 w-full">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <AiOutlineExclamationCircle className="text-red-500 font-bold" />
                          <div className="text-red-500 font-bold text-sm">{translateField(correction.field)}</div>
                        </div>
                        {correction?.reason ? <div className="text-gray-900 text-base font-medium">Motif : {translateCorrectionReason(correction.reason)}</div> : null}
                        {correction?.message ? <div className="text-sm text-gray-600 font-normal">{correction.message}</div> : null}
                      </div>
                      <button
                        className="text-blue-600 font-medium border-[1px] border-blue-600 px-2 py-2 text-sm hover:text-white hover:bg-blue-600 rounded-lg"
                        onClick={() => history.push(redirectToCorrection(correction.field))}>
                        Corriger
                      </button>
                    </div>
                    <hr className="border-gray-200" />
                  </>
                );
              })}
            </div>
            <div className="flex justify-center mt-20">
              <a
                className="w-36"
                href="https://voxusagers.numerique.gouv.fr/Demarches/3154?&view-mode=formulaire-avis&nd_mode=en-ligne-enti%C3%A8rement&nd_source=button&key=060c41afff346d1b228c2c02d891931f"
                onClick={() => plausibleEvent("Compte/CTA - Je donne mon avis", { statut: translate(young.status) })}>
                <img src="https://voxusagers.numerique.gouv.fr/static/bouton-blanc.svg" alt="Je donne mon avis" />
              </a>
            </div>
          </div>
          <img src={require("../../assets/homePhase2Mobile.png")} />
        </div>
      </div>
    </>
  );
}
