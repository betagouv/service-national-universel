import React from "react";
import { FiChevronDown } from "react-icons/fi";
import XCircleFill from "../../../../../assets/icons/XCircleFill";

export default function CensusNotDone({ isOpen, setIsOpen }) {
  return (
    <div className="border-b md:mt-3 md:rounded-lg md:border-0 md:shadow-ninaBlock">
      <div className={`flex cursor-pointer items-center gap-3 px-3 ${isOpen ? "pt-3" : "py-3"}`} onClick={() => setIsOpen(!isOpen)}>
        <XCircleFill className="h-5 w-5 flex-none text-red-500" />
        <p className="p-2 text-base font-bold">
          Je n&apos;ai <strong>pas</strong> effectué mon recensement citoyen
        </p>
        <FiChevronDown className={`ml-auto h-6 w-6 flex-none cursor-pointer text-gray-400 hover:scale-105 ${isOpen && "rotate-180"}`} />
      </div>

      {isOpen && (
        <div className="p-3 text-base">
          <div className="p-2">
            <p className="leading-5 text-gray-800">
              1. <strong>Recensez-vous</strong> auprès de votre mairie ou en ligne à partir de vos 16 ans, vous recevez votre convocation à la JDC.
            </p>
            <a
              target="_blank"
              rel="noreferrer"
              href="https://www.service-public.fr/particuliers/vosdroits/F870"
              className="mt-1.5 cursor-pointer text-xs leading-5 text-blue-600 underline hover:underline">
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
              className="mt-1.5 cursor-pointer text-xs leading-5 text-blue-600 underline hover:underline">
              En savoir plus sur la procédure
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
