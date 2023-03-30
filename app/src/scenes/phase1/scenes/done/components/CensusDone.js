import React from "react";
import CheckCircleFill from "../../../../../assets/icons/CheckCircleFill";
import { FiChevronDown } from "react-icons/fi";

export default function CensusDone({ isOpen, setIsOpen }) {
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
