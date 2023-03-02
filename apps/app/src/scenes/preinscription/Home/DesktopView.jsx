import React from "react";
import { appURL, supportURL } from "../../../config";
import plausibleEvent from "../../../services/plausible";
import informations from "./informations";

export default function DesktopView() {
  return (
    <div>
      <div className="px-14 mt-4">
        <div className="flex justify-around flex-wrap  border-b pb-4 border-[#DFDFDF]">
          {informations.map((val) => {
            return (
              <div key={val.title} className="w-96 text-center mt-2 p-2 pt-5">
                <span className="bg-[#fff] p-3 rounded-md shadow-2xl text-[26px]">{val.icon}</span>
                <h5 className="mt-4 mb-2 text-[#111827]">{val.title}</h5>
                <p className="text-[#6b7280] break-words">{val.text}</p>
              </div>
            );
          })}
        </div>
        {/* Question Secction */}
        <div className="flex justify-evenly flex-wrap py-4">
          <div className="w-full p-3 md:w-2/4">
            <p className="text-[#6b7280]">
              <strong className="text-black">Et après le séjour ?</strong>
              <br /> Vous recevez votre certificat individuel de participation à la JDC et un accès gratuit à une plateforme d&apos;apprentissage du code de la route.
              <br />
              Qu&apos;attendez-vous pour vous inscrire ?
            </p>
          </div>
        </div>
      </div>
      {/* Title Container */}

      {/* Grid Container */}
      <div className="hidden lg:block ">
        <div className="ml-2 flex justify-between">
          <div className="flex  w-6/12	p-[2rem]">
            <svg className="mt-2" width="40" height="40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="40" height="40" rx="8" fill="#32257F" />
              <path d="M21 24h-1v-4h-1l2 4zm-1-8h.01H20zm9 4a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {/* Info */}
            <div className="pl-3 text-[#6a7181] text-sm">
              <p>Pour compléter l&apos;inscription en quelques minutes, il vous faudra :</p>
              <p>
                • Une <b>pièce d&apos;identité</b> (Carte Nationale d&apos;Identité ou Passeport)
                <br />• L&apos;accord de votre ou vos <b>représentants légaux</b>
              </p>
            </div>
          </div>
          {/* Line  */}
          <div className="w-[1px] bg-[#DFDFDF]"></div>

          <div className="flex  w-6/12 p-[2rem]	ml-3">
            <svg className="mt-2" width="40" height="40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="40" height="40" rx="8" fill="#32257F" />
              <path
                d="M16.228 17c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M29 20a9 9 0 11-18 0 9 9 0 0118 0z"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <a className="pl-3 pt-2 text-[#32267f] text-sm hover:text-[#32267f]" onClick={() => plausibleEvent("LP - Aide")} href={`${appURL}/public-besoin-d-aide`} target="blank">
              <p>
                <strong>Besoin d&apos;aide ?</strong>
              </p>
              <p>Toutes les réponses à vos questions</p>
            </a>
          </div>
        </div>
      </div>
      {/* Mobile View Question */}
      <div className="block lg:hidden bg-[#32267f] p-[1rem]">
        <div className="flex justify-evenly">
          <a className="text-[#fff]" onClick={() => plausibleEvent("LP - Aide")} href={`${supportURL}/base-de-connaissance/questions-frequentes-1`} target="blank">
            <p>Toutes les réponses à vos questions</p>
          </a>
          <svg className="mt-[7px]" width="6" height="10" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M.293 9.707a1 1 0 010-1.414L3.586 5 .293 1.707A1 1 0 011.707.293l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              fill="#fff"
            />
          </svg>
        </div>
      </div>
      {/* Mobile View Question */}
    </div>
  );
}
