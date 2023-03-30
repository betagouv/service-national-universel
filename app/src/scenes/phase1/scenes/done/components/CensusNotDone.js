import React from "react";
import { FiChevronDown } from "react-icons/fi";
import XCircleFill from "../../../../../assets/icons/XCircleFill";

export default function CensusNotDone({ isOpen, setIsOpen }) {
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
