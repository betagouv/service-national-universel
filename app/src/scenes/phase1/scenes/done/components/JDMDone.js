import React from "react";
import { FiChevronDown } from "react-icons/fi";
import { RiErrorWarningFill } from "react-icons/ri";
import CheckCircleFill from "../../../../../assets/icons/CheckCircleFill";
import Unlock from "../../../../../assets/icons/Unlock";
import XCircleFill from "../../../../../assets/icons/XCircleFill";

export default function JDMDone() {
  const [checkOpen, setCheckOpen] = React.useState(false);
  const [differOpen, setDifferOpen] = React.useState(false);
  const [FaqOpen, setFaqOpen] = React.useState(false);
  const [Faq2Open, setFaq2Open] = React.useState(false);

  return (
    <div className="flex flex-col w-full lg:w-1/2 items-stretch px-10 gap-3">
      <div className="flex justify-center">
        <Unlock />
      </div>
      <div className="leading-7 text-xl text-center font-bold">
        Obtenez votre certificat <br /> de participation à la JDC !
      </div>
      <div className="text-xs leading-4 font-medium text-gray-500 text-center w-full">grâce à la validation de votre phase 1</div>
      <div className="flex flex-col rounded-lg shadow-ninaBlock mt-3">
        <div
          className={`flex items-center justify-between cursor-pointer px-4 ${checkOpen ? "pt-4" : "py-4"}`}
          onClick={() => {
            setCheckOpen(!checkOpen);
            setFaqOpen(false);
            if (differOpen) setDifferOpen(false);
          }}>
          <div className="flex items-center gap-3">
            <CheckCircleFill className="text-green-500 w-5 h-5" />
            <div className="text-base font-bold">
              J’ai <strong>effectué</strong> mon recensement citoyen
            </div>
          </div>
          <FiChevronDown className={`text-gray-400 w-6 h-6 cursor-pointer hover:scale-105 ${checkOpen ? "rotate-180" : ""}`} />
        </div>
        {checkOpen ? (
          <div className="px-3 pb-3">
            <div className="text-sm leading-5 font-medium text-gray-800 mt-3 px-2 text-justify">
              Vous recevrez automatiquement votre certificat individuel de participation après le séjour. Vous n’avez rien à faire.
            </div>
            <div className="text-[13px] leading-5 text-gray-500 mt-3 px-2 text-justify">
              <RiErrorWarningFill className="w-4 h-4 inline mr-1 align-text-bottom" />
              Attention, si vous n’avez pas pu participer à la Journée défense et mémoire (JDM), vous devrez tout de même réaliser votre JDC.
            </div>
            <a
              target="_blank"
              rel="noreferrer"
              href="https://support.snu.gouv.fr/base-de-connaissance/journee-defense-et-citoyennete"
              className="text-sm px-2 leading-5 cursor-pointer underline text-blue-600 hover:underline">
              En savoir plus
            </a>
            <div className="w-full rounded-lg bg-gray-100 mt-3 py-3 px-2 cursor-pointer ">
              <div className="text-base leading-6 font-bold ml-2" onClick={() => setFaqOpen(!FaqOpen)}>
                Voir la F.A.Q
              </div>
              {FaqOpen ? (
                <div className="ml-2">
                  <div className="text-sm leading-5 font-medium text-gray-800 mt-3">Je n’ai pas reçu mon certificat...</div>
                  <div className="text-[13px] leading-5 text-gray-500 text-justify mt-1">
                    Rapprochez-vous de votre CSNJ (Centre du service national et de la jeunesse de votre lieu de résidence) pour vérifier votre situation.
                  </div>
                  <div className="text-sm leading-5 font-medium text-gray-800 mt-3">J’ai quand même reçu ma convocation à la JDC...</div>
                  <div className="text-[13px] leading-5 text-gray-500 text-justify mt-1">
                    Dans ce cas, transmettez votre attestation de réalisation de phase 1 au CSNJ afin de recevoir votre CIP à la JDC.
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
      <div className="flex flex-col rounded-lg shadow-ninaBlock">
        <div
          className={`flex items-center justify-between cursor-pointer px-4 ${differOpen ? "pt-3" : "py-3"}`}
          onClick={() => {
            setDifferOpen(!differOpen);
            setFaq2Open(false);
            if (checkOpen) setCheckOpen(false);
          }}>
          <div className="flex items-center gap-3">
            <XCircleFill className="text-red-500 w-5 h-5" />
            <div className="text-base font-bold">
              Je n’ai <strong>pas</strong> effectué mon recensement <br /> citoyen
            </div>
          </div>
          <FiChevronDown className={`text-gray-400 w-6 h-6 cursor-pointer hover:scale-105 ${differOpen ? "rotate-180" : ""}`} />
        </div>
        {differOpen ? (
          <div className="px-3 pb-3">
            <div className="text-sm leading-5 font-medium text-gray-800 mt-3 px-2 text-justify">
              Recensez-vous auprès de votre mairie ou en ligne à partir de vos 16 ans, vous recevez votre convocation à la JDC.
            </div>
            <a
              target="_blank"
              rel="noreferrer"
              href="https://www.service-public.fr/particuliers/vosdroits/F870"
              className="text-sm px-2 leading-5 cursor-pointer underline text-blue-600 hover:underline mt-1.5">
              En savoir plus sur le recensement
            </a>
            <div className="text-[13px] leading-5 text-[#738297] mt-3 px-2 text-justify">
              <RiErrorWarningFill className="w-4 h-4 inline mr-1 align-text-bottom" />
              Attention, si vous n’avez pas pu participer à la Journée défense et mémoire (JDM), vous devrez tout de même réaliser votre JDC.
            </div>
            <a
              target="_blank"
              rel="noreferrer"
              href="https://support.snu.gouv.fr/base-de-connaissance/journee-defense-et-citoyennete"
              className="text-sm px-2 leading-5 cursor-pointer underline text-blue-600 hover:underline">
              En savoir plus
            </a>
            <div className="w-full rounded-lg bg-gray-100 mt-3 py-3 px-3 cursor-pointer ">
              <div className="text-sm leading-6 font-medium" onClick={() => setFaq2Open(!Faq2Open)}>
                Vous ne souhaitez par réaliser votre JDC ?
              </div>
              {Faq2Open ? (
                <>
                  <div className="text-[13px] leading-5 text-[#738297] text-justify mt-1">
                    Transmettez votre attestation de réalisation de la phase 1 à votre CSNJ pour obtenir votre certificat de participation à la JDC.
                  </div>
                  <a
                    target="_blank"
                    rel="noreferrer"
                    href="https://support.snu.gouv.fr/base-de-connaissance/journee-defense-et-citoyennete"
                    className="text-sm leading-5 cursor-pointer underline text-blue-600 hover:underline mt-1.5">
                    En savoir plus sur la procédure
                  </a>
                </>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
