import Img2 from "../../assets/homePhase2Mobile.png";
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
          <div className="flex items-stretch justify-between rounded-lg bg-white">
            <div className="w-full p-10">
              <div className="text-[44px] font-medium leading-tight tracking-tight text-gray-800">
                <strong>{young.firstName},</strong> nous sommes désolés.
              </div>
              <div className="mt-3 text-xl font-bold text-[#242526]">Votre inscription n&apos;a pas pu être retenue.</div>
              <div className="mt-2 text-sm text-[#738297]">
                Suite au traitement de votre dossier d&apos;inscription, votre référent n&apos;a pas pu retenir votre inscription, en voici la raison principale&nbsp;:
                <div className="mt-1">{young?.inscriptionRefusedMessage}</div>
              </div>
              <Engagement />
            </div>
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
        <div className="flex w-full flex-col">
          <img src={Img2} />
          <div className="w-full flex-col px-4 pb-4">
            <div className="text-3xl font-medium leading-tight tracking-tight text-gray-800">
              <strong>{young.firstName},</strong> nous sommes désolés.
            </div>
            <div className="mt-3 text-base font-bold text-[#242526]">Votre inscription n&apos;a pas pu être retenue.</div>
            <div className="mt-2 text-sm text-[#738297]">
              Suite au traitement de votre dossier d&apos;inscription, votre référent n&apos;a pas pu retenir votre inscription, en voici la raison principale&nbsp;:
              <div className="mt-1">{young?.inscriptionRefusedMessage}</div>
            </div>
            <Engagement />
            <div className="my-8 flex justify-center">
              <div
                className="w-full cursor-pointer border-[1px] border-[#000091] p-2  text-center text-[#000091]"
                onClick={() => {
                  history.push("/public-engagements");
                }}>
                Voir plus de formes d’engagement
              </div>
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
        </div>
      </div>
    </>
  );
}
