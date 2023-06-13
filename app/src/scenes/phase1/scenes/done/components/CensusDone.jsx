import React from "react";
import CheckCircleFill from "../../../../../assets/icons/CheckCircleFill";
import { FiChevronDown } from "react-icons/fi";

export default function CensusDone({ isOpen, setIsOpen }) {
  return (
    <div className="mt-3 border-t border-b md:rounded-lg md:border-0 md:shadow-ninaBlock">
      <div className={`flex cursor-pointer items-center gap-3 px-3 ${isOpen ? "pt-3" : "py-3"}`} onClick={() => setIsOpen(!isOpen)}>
        <CheckCircleFill className="h-6 w-6 flex-none text-green-500" />
        <p className="p-2 text-base font-bold">
          J’ai <strong>effectué</strong> mon recensement citoyen
        </p>
        <FiChevronDown className={`ml-auto h-6 w-6 flex-none text-gray-400 hover:scale-105 ${isOpen && "rotate-180"}`} />
      </div>
      {isOpen && (
        <div className="px-3 pb-3">
          <p className="px-2 text-base font-medium leading-loose text-gray-800">Vous n’avez rien à faire.</p>
          <p className="px-2 text-base font-medium text-gray-800">Vous recevrez automatiquement votre CIP (Certificat Individuel de Participation) après le séjour.</p>

          <div className="mt-3 w-full rounded-xl bg-gray-100 p-3 text-gray-800">
            <p className="text-sm font-medium leading-5 ">Je n’ai pas reçu mon certificat...</p>
            <p className="mt-1 text-justify text-xs leading-5 text-gray-700">
              Rapprochez-vous de votre CSNJ (Centre du service national et de la jeunesse de votre lieu de résidence) pour vérifier votre situation.
            </p>

            <p className="mt-3 text-sm font-medium leading-5 text-gray-800">J’ai quand même reçu ma convocation à la JDC...</p>
            <p className="mt-1 text-justify text-xs leading-5 text-gray-700">
              Dans ce cas, transmettez votre attestation de réalisation de phase 1 au CSNJ afin de recevoir votre CIP à la JDC.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
