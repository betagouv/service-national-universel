import React from "react";
import { AiOutlineExclamationCircle } from "react-icons/ai";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

import { translateField, translateCorrectionReason, formatDateFR, PHASE1_YOUNG_ACCESS_LIMIT, translate, YOUNG_STATUS, inscriptionModificationOpenForYoungs } from "snu-lib";
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
          <div className="flex items-stretch justify-between rounded-lg bg-white">
            <div className="w-1/2 py-6 pl-10">
              <div className="text-[44px] font-medium leading-tight tracking-tight text-gray-800">
                <strong>{young.firstName},</strong> bienvenue sur votre compte volontaire.
              </div>
              <div className="mt-3 text-xl font-bold text-[#242526]">Votre dossier d’inscription est en attente de correction.</div>
              {/* <div className="text-[#738297] text-sm mt-2">
                Merci d’effectuer <b>avant le {formatDateFR(PHASE1_YOUNG_ACCESS_LIMIT[young.cohort])} inclus</b> les modifications demandées par votre référent :
              </div> */}
              <div className="mt-3 flex max-h-[250px] flex-col gap-5 overflow-auto">
                <hr className="border-gray-200" />
                {young.correctionRequests.map((correction, i) => {
                  if (!["SENT", "REMINDED"].includes(correction.status)) return null;
                  return (
                    <>
                      <div key={i} className="flex items-center justify-between gap-4 pr-2">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <AiOutlineExclamationCircle className="font-bold text-red-500" />
                            <div className="text-sm font-bold text-red-500">{translateField(correction.field)}</div>
                          </div>
                          {correction?.reason ? <div className="text-base font-medium text-gray-900">Motif : {translateCorrectionReason(correction.reason)}</div> : null}
                          {correction?.message ? <div className="text-sm font-normal text-gray-600">{correction.message}</div> : null}
                        </div>
                        <button
                          className="rounded-lg border-[1px] border-blue-600 px-2 py-2 text-sm font-medium text-blue-600 hover:bg-blue-600 hover:text-white disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-50"
                          onClick={() => history.push(redirectToCorrection(correction.field))}
                          disabled={young.status === YOUNG_STATUS.WAITING_CORRECTION && !inscriptionModificationOpenForYoungs(young.cohort)}>
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
          <div className="mt-10 flex justify-end">
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
      <div className="flex w-full flex-col lg:hidden">
        <div className="flex w-full flex-col-reverse">
          <div className="w-full flex-col px-4 pb-4">
            <div className="text-3xl font-medium leading-tight tracking-tight text-gray-800">
              <strong>{young.firstName},</strong> bienvenue sur votre compte volontaire.
            </div>
            <div className="mt-3 text-base font-bold text-[#242526]">Votre dossier d’inscription est en attente de correction.</div>
            {/* <div className="mt-2 text-sm text-[#738297]">
              Merci d’effectuer avant le <b>{formatDateFR(PHASE1_YOUNG_ACCESS_LIMIT[young.cohort])} inclus</b> les modifications demandées par votre référent :
            </div> */}
            <div className="mt-3 flex flex-col gap-5">
              <hr className="border-gray-200" />
              {young.correctionRequests.map((correction, i) => {
                if (!["SENT", "REMINDED"].includes(correction.status)) return null;
                return (
                  <>
                    <div key={i} className="flex w-full flex-col gap-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <AiOutlineExclamationCircle className="font-bold text-red-500" />
                          <div className="text-sm font-bold text-red-500">{translateField(correction.field)}</div>
                        </div>
                        {correction?.reason ? <div className="text-base font-medium text-gray-900">Motif : {translateCorrectionReason(correction.reason)}</div> : null}
                        {correction?.message ? <div className="text-sm font-normal text-gray-600">{correction.message}</div> : null}
                      </div>
                      <button
                        className="rounded-lg border-[1px] border-blue-600 px-2 py-2 text-sm font-medium text-blue-600 hover:bg-blue-600 hover:text-white"
                        onClick={() => history.push(redirectToCorrection(correction.field))}>
                        Corriger
                      </button>
                    </div>
                    <hr className="border-gray-200" />
                  </>
                );
              })}
            </div>
            <div className="mt-20 flex justify-center">
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
