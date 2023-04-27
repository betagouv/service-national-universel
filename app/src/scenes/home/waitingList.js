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
          <div className="flex items-center justify-between overflow-hidden rounded-xl bg-white shadow-sm">
            <div className="flex w-1/2 flex-col gap-8 py-6 pl-10 pr-3">
              <div className="text-[44px] font-medium leading-tight tracking-tight text-gray-800">
                <strong>{young.firstName},</strong> bienvenue sur votre compte volontaire.
              </div>
              <div className="mt-2 text-xl font-bold text-[#242526]">
                Vous êtes inscrit{young?.gender === "female" && "e"} sur liste complémentaire pour le séjour {COHESION_STAY_LIMIT_DATE[young.cohort]}.
              </div>

              <hr className="text-gray-200" />
              <div className="flex items-center gap-5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 p-2">
                  <Check className="text-gray-600" />
                </div>
                <div className="flex-1 text-sm leading-5 text-[#6B7280]">
                  Votre inscription au SNU est bien validée. Nous vous recontacterons dès qu’une place se libère dans les prochains jours.
                </div>
              </div>
              <hr className="text-gray-200" />
            </div>
            <img className="w-1/2 object-fill" src={require("../../assets/homePhase2Desktop.png")} />
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
        <div className="flex flex-col-reverse bg-white">
          <div className="flex flex-col gap-4 px-4 pb-8   ">
            <div className="text-3xl font-medium leading-tight tracking-tight text-gray-800">
              <strong>{young.firstName},</strong> bienvenue sur votre compte volontaire.
            </div>
            <div className="mt-3 text-lg font-bold text-[#242526]">
              Vous êtes inscrit{young?.gender === "female" && "e"} sur liste complémentaire pour le séjour {COHESION_STAY_LIMIT_DATE[young.cohort]}.
            </div>

            <hr className="mt-3 text-gray-200" />
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 p-2">
                <Check className="text-gray-600" />
              </div>
              <div className="flex-1 text-sm text-[#738297]">
                Votre inscription au SNU est bien validée. Nous vous recontacterons dès qu’une place se libère dans les prochains jours.
              </div>
            </div>
            <hr className="text-gray-200" />

            <div className="mt-20 flex justify-center">
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
