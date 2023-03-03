import React from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { translate } from "snu-lib";
import Check from "../../assets/icons/Check";
import plausibleEvent from "../../services/plausible";
import { COHESION_STAY_LIMIT_DATE } from "../../utils";

export default function WaitingList() {
  const young = useSelector((state) => state.Auth.young);
  const history = useHistory();

  return (
    <>
      {/* DESKTOP */}
      <div className="hidden lg:flex">
        <div className="m-10 w-full">
          <div className="flex justify-between items-center rounded-xl bg-white ">
            <div className="flex flex-col gap-8 w-1/2 pl-10 py-6 pr-3">
              <div className="text-[44px] font-medium leading-tight tracking-tight text-gray-800">
                <strong>{young.firstName},</strong> bienvenue sur votre compte volontaire.
              </div>
              <div className="text-[#242526] font-bold text-xl mt-2">Vous êtes inscrit sur liste complémentaire pour le séjour {COHESION_STAY_LIMIT_DATE[young.cohort]}.</div>

              <hr className="text-gray-200" />
              <div className="flex items-center gap-5">
                <div className="flex items-center justify-center p-2 h-8 w-8 rounded-full bg-gray-100">
                  <Check className="text-gray-600" />
                </div>
                <div className="text-[#6B7280] text-sm leading-5 flex-1">
                  Votre dossier a été traité. L’administration du SNU vous contactera au plus vite pour vous informer de votre participation au Service National Universel. Vous
                  pouvez également vous positionner sur un autre séjour dès maintenant.
                </div>
              </div>
              <hr className="text-gray-200" />
              <div className="text-blue-600 text-sm leading-5 hover:underline cursor-pointer" onClick={() => history.push("/changer-de-sejour")}>
                Changer de séjour &gt;
              </div>
            </div>
            <img className="w-1/2 object-fill" src={require("../../assets/homePhase2Desktop.png")} />
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
        <div className="flex flex-col-reverse bg-white">
          <div className="flex flex-col gap-4 px-4 pb-8   ">
            <div className="text-3xl font-medium leading-tight tracking-tight text-gray-800">
              <strong>{young.firstName},</strong> bienvenue sur votre compte volontaire.
            </div>
            <div className="text-[#242526] font-bold text-lg mt-3">Vous êtes inscrit sur liste complémentaire pour le séjour {COHESION_STAY_LIMIT_DATE[young.cohort]}.</div>

            <hr className="text-gray-200 mt-3" />
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center p-2 h-8 w-8 rounded-full bg-gray-100">
                <Check className="text-gray-600" />
              </div>
              <div className="text-[#738297] text-sm flex-1">
                Votre dossier a été traité. L’administration du SNU vous contactera au plus vite pour vous informer de votre participation au Service National Universel. Vous
                pouvez également vous positionner sur un autre séjour dès maintenant.
              </div>
            </div>
            <hr className="text-gray-200" />
            <div className="text-blue-600 text-sm leading-5 " onClick={() => history.push("/changer-de-sejour")}>
              Changer de séjour &gt;
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
          <img className="object-contain" src={require("../../assets/homePhase2Mobile.png")} />
        </div>
      </div>
    </>
  );
}
