import React from "react";
import { FiChevronDown } from "react-icons/fi";
import CheckCircleFill from "../../../../../assets/icons/CheckCircleFill";
import Unlock from "../../../../../assets/icons/Unlock";
import XCircleFill from "../../../../../assets/icons/XCircleFill";

export default function JDMDone() {
  const [isCensusDoneOpen, setIsCensusDoneOpen] = React.useState(false);
  const [isCensusNotDoneOpen, setIsCensusNotDoneOpen] = React.useState(false);

  return (
    <div className="flex flex-col w-full lg:w-1/2 items-stretch mt-8 mb-16 md:mb-8 md:px-10 gap-3">
      <div className="flex justify-center">
        <Unlock />
      </div>
      <p className="text-lg text-center font-bold">Vous avez participé à la JDM</p>
      <p className="leading-7 text-xl text-center font-bold">
        Obtenez votre certificat <br /> de participation à la JDC !
      </p>

      <div className="space-y-0 md:space-y-6">
        <CensusDone isOpen={isCensusDoneOpen} setIsOpen={setIsCensusDoneOpen} />
        <CensusNotDone isOpen={isCensusNotDoneOpen} setIsOpen={setIsCensusNotDoneOpen} />
      </div>
    </div>
  );
}

function CensusDone({ isOpen, setIsOpen }) {
  return (
    <div className="md:rounded-lg md:shadow-ninaBlock mt-3 border-t border-b md:border-0">
      <div className={`flex items-center gap-3 px-3 cursor-pointer ${isOpen ? "pt-3" : "py-3"}`} onClick={() => setIsOpen(!isOpen)}>
        <CheckCircleFill className="text-green-500 w-6 h-6 flex-none" />
        <p className="text-base font-bold p-2">
          J’ai <strong>effectué</strong> mon recensement citoyen
        </p>
        <FiChevronDown className={`text-gray-400 w-6 h-6 flex-none hover:scale-105 ml-auto ${isOpen && "rotate-180"}`} />
      </div>
      {isOpen && (
        <div className="px-3 pb-3">
          <p className="text-base leading-loose font-medium text-gray-800 px-2">Vous n’avez rien à faire.</p>
          <p className="text-base font-medium text-gray-800 px-2">Vous recevrez automatiquement votre CIP (Certificat Individuel de Participation) après le séjour.</p>

          <div className="w-full rounded-xl bg-gray-100 text-gray-800 mt-3 p-3">
            <p className="text-sm leading-5 font-medium ">Je n’ai pas reçu mon certificat...</p>
            <p className="text-xs leading-5 text-gray-700 text-justify mt-1">
              Rapprochez-vous de votre CSNJ (Centre du service national et de la jeunesse de votre lieu de résidence) pour vérifier votre situation.
            </p>

            <p className="text-sm leading-5 font-medium text-gray-800 mt-3">J’ai quand même reçu ma convocation à la JDC...</p>
            <p className="text-xs leading-5 text-gray-700 text-justify mt-1">
              Dans ce cas, transmettez votre attestation de réalisation de phase 1 au CSNJ afin de recevoir votre CIP à la JDC.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function CensusNotDone({ isOpen, setIsOpen }) {
  return (
    <div className="md:rounded-lg md:shadow-ninaBlock md:mt-3 border-b md:border-0">
      <div className={`flex items-center gap-3 px-3 cursor-pointer ${isOpen ? "pt-3" : "py-3"}`} onClick={() => setIsOpen(!isOpen)}>
        <XCircleFill className="text-red-500 w-5 h-5 flex-none" />
        <p className="text-base font-bold p-2">
          Je n&apos;ai <strong>pas</strong> effectué mon recensement citoyen
        </p>
        <FiChevronDown className={`text-gray-400 w-6 h-6 flex-none cursor-pointer hover:scale-105 ml-auto ${isOpen && "rotate-180"}`} />
      </div>

      {isOpen && (
        <div className="text-base p-3">
          <div className="p-2">
            <p className="leading-5 text-gray-800">
              1. <strong>Recensez-vous</strong> auprès de votre mairie ou en ligne à partir de vos 16 ans, vous recevez votre convocation à la JDC.
            </p>
            <a
              target="_blank"
              rel="noreferrer"
              href="https://www.service-public.fr/particuliers/vosdroits/F870"
              className="text-xs leading-5 cursor-pointer underline text-blue-600 hover:underline mt-1.5">
              En savoir plus sur le recensement
            </a>
          </div>

          <div className="p-2">
            <p className="leading-5 text-gray-800">
              2. <strong>Envoyez votre attestation</strong> de réalisation de phase 1 au CSNJ (Centre du service national et de la jeunesse de votre lieu de résidence){" "}
              <strong>afin de recevoir votre CIP</strong> (Certificat individuel de participation) à la JDC.
            </p>
            <a
              target="_blank"
              rel="noreferrer"
              href="https://support.snu.gouv.fr/base-de-connaissance/journee-defense-et-citoyennete"
              className="text-xs leading-5 cursor-pointer underline text-blue-600 hover:underline mt-1.5">
              En savoir plus sur la procédure
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
