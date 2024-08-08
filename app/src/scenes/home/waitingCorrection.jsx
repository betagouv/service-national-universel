import Img3 from "../../assets/homePhase2Desktop.png";
import Img2 from "../../assets/homePhase2Mobile.png";
import React from "react";
import { AiOutlineExclamationCircle } from "react-icons/ai";
import { useHistory } from "react-router-dom";

import { translateField, translateCorrectionReason, translate, YOUNG_STATUS, inscriptionModificationOpenForYoungs } from "snu-lib";
import plausibleEvent from "../../services/plausible";
import { redirectToCorrection } from "../../utils/navigation";
import { getCohort } from "@/utils/cohorts";
import useAuth from "@/services/useAuth";

export default function WaitingCorrection() {
  const { young, isCLE } = useAuth();
  const cohort = getCohort(young.cohort);
  const history = useHistory();

  return (
    <>
      {/* DESKTOP */}
      <div className="hidden lg:flex">
        <div className="my-12 mx-10 w-full">
          <div className="flex items-stretch justify-between rounded-lg bg-white">
            <div className="w-1/2 py-6 pl-10">
              <div className="text-[44px] font-medium leading-tight tracking-tight text-gray-800">
                <strong>{young.firstName}, </strong>
                {isCLE ? "bienvenue sur votre compte élève." : "bienvenue sur votre compte volontaire."}
              </div>
              <div className="mt-3 text-xl font-bold text-[#242526]">Votre dossier d’inscription est en attente de correction.</div>
              <div className="mt-3 flex max-h-[250px] flex-col gap-5 overflow-auto">
                <hr className="border-gray-200" />
                {young.correctionRequests?.map((correction, i) => {
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
                          className="rounded-lg border-[1px] border-blue-600 px-2 py-2 text-sm font-medium text-blue-600 hover:!disabled:bg-blue-600 hover:!disabled:text-white disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-50"
                          onClick={() => history.push(redirectToCorrection(young, correction.field))}
                          disabled={young.status === YOUNG_STATUS.WAITING_CORRECTION && !inscriptionModificationOpenForYoungs(cohort)}>
                          Corriger
                        </button>
                      </div>
                      {!inscriptionModificationOpenForYoungs(cohort) && (
                        <span className="text-sm leading-5 text-[#6B7280]">La date limite pour modifier votre dossier d'inscription a été dépassée.</span>
                      )}
                      <hr className="border-gray-200" />
                    </>
                  );
                })}
              </div>
            </div>
            <img className="w-1/2 object-fill" src={Img3} />
          </div>
          {!isCLE && (
            <div className="mt-10 flex justify-end">
              <a
                className="w-40"
                href="https://voxusagers.numerique.gouv.fr/Demarches/3154?&view-mode=formulaire-avis&nd_mode=en-ligne-enti%C3%A8rement&nd_source=button&key=060c41afff346d1b228c2c02d891931f"
                onClick={() => plausibleEvent("Compte/CTA - Je donne mon avis", { statut: translate(young.status) })}>
                <img src="https://voxusagers.numerique.gouv.fr/static/bouton-blanc.svg" alt="Je donne mon avis" />
              </a>
            </div>
          )}
        </div>
      </div>
      {/* MOBILE */}
      <div className="flex w-full flex-col lg:hidden">
        <div className="flex w-full flex-col-reverse">
          <div className="w-full flex-col px-4 pb-4">
            <div className="text-3xl font-medium leading-tight tracking-tight text-gray-800">
              <strong>{young.firstName}, </strong>
              {isCLE ? "bienvenue sur votre compte élève." : "bienvenue sur votre compte volontaire."}
            </div>
            <div className="mt-3 text-base font-bold text-[#242526]">Votre dossier d’inscription est en attente de correction.</div>
            <div className="mt-3 flex flex-col gap-5">
              <hr className="border-gray-200" />
              {young.correctionRequests?.map((correction, i) => {
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
                        disabled={young.status === YOUNG_STATUS.WAITING_CORRECTION && !inscriptionModificationOpenForYoungs(cohort)}
                        className="rounded-lg border-[1px] border-blue-600 px-2 py-2 text-sm font-medium text-blue-600 hover:!disabled:bg-blue-600 hover:!disabled:text-white disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-50"
                        onClick={() => history.push(redirectToCorrection(young, correction.field))}>
                        Corriger
                      </button>
                    </div>
                    {!inscriptionModificationOpenForYoungs(cohort) && (
                      <span className="text-sm leading-5 text-[#6B7280]">La date limite pour modifier votre dossier d'inscription a été dépassée.</span>
                    )}
                    <hr className="border-gray-200" />
                  </>
                );
              })}
            </div>
            {!isCLE && (
              <div className="mt-20 flex justify-end">
                <a
                  className="w-36"
                  href="https://voxusagers.numerique.gouv.fr/Demarches/3154?&view-mode=formulaire-avis&nd_mode=en-ligne-enti%C3%A8rement&nd_source=button&key=060c41afff346d1b228c2c02d891931f"
                  onClick={() => plausibleEvent("Compte/CTA - Je donne mon avis", { statut: translate(young.status) })}>
                  <img src="https://voxusagers.numerique.gouv.fr/static/bouton-blanc.svg" alt="Je donne mon avis" />
                </a>
              </div>
            )}
          </div>
          <img src={Img2} />
        </div>
      </div>
    </>
  );
}
