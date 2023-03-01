import React from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

import { translate } from "snu-lib";
import plausibleEvent from "../../services/plausible";
import Engagement from "./components/Engagement";

export default function RefusedV2() {
  const young = useSelector((state) => state.Auth.young);
  const history = useHistory();

  return (
    <>
      {/* DESKTOP */}
      <div className="hidden lg:flex">
        <div className="my-12 mx-10 w-full">
          <div className="flex justify-between items-stretch rounded-lg bg-white">
            <div className="w-full p-10">
              <div className="text-[44px] font-medium leading-tight tracking-tight text-gray-800">
                <strong>{young.firstName},</strong> nous sommes désolés.
              </div>
              <div className="text-[#242526] font-bold text-xl mt-3">Votre inscription n&apos;a pas pu être retenue.</div>
              <div className="text-[#738297] text-sm mt-2">
                Suite au traitement de votre dossier d&apos;inscription, votre référent n&apos;a pas pu retenir votre inscription, en voici la raison principale&nbsp;:
                <div className="mt-1">{young?.inscriptionRefusedMessage}</div>
              </div>
              <Engagement />
            </div>
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
        <div className="flex flex-col w-full">
          <img src={require("../../assets/homePhase2Mobile.png")} />
          <div className="px-4 pb-4 flex-col w-full">
            <div className="text-3xl font-medium leading-tight tracking-tight text-gray-800">
              <strong>{young.firstName},</strong> nous sommes désolés.
            </div>
            <div className="text-[#242526] font-bold text-base mt-3">Votre inscription n&apos;a pas pu être retenue.</div>
            <div className="text-[#738297] text-sm mt-2">
              Suite au traitement de votre dossier d&apos;inscription, votre référent n&apos;a pas pu retenir votre inscription, en voici la raison principale&nbsp;:
              <div className="mt-1">{young?.inscriptionRefusedMessage}</div>
            </div>
            <Engagement />
            <div className="flex justify-center my-8">
              <div
                className="text-[#000091] text-center border-[1px] border-[#000091] w-full  p-2 cursor-pointer"
                onClick={() => {
                  history.push("/public-engagements");
                }}>
                Voir plus de formes d’engagement
              </div>
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
        </div>
      </div>
    </>
  );
}
