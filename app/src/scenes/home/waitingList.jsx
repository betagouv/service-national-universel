import Img3 from "../../assets/homePhase2Desktop.png";
import Img2 from "../../assets/homePhase2Mobile.png";
import React from "react";
import { useSelector } from "react-redux";
import { translate } from "snu-lib";
import plausibleEvent from "../../services/plausible";
import { COHESION_STAY_LIMIT_DATE } from "../../utils";
import { getCohort } from "../../utils/cohorts";
import Clock from "../../assets/icons/Clock";
import LinkInline from "../../components/ui/links/LinkInline";

export default function WaitingList() {
  const young = useSelector((state) => state.Auth.young);
  const cohort = getCohort(young.cohort);

  return (
    <>
      {/* DESKTOP */}
      <div className="hidden lg:flex">
        <div className="m-8 w-full">
          <div className="flex items-center justify-between overflow-hidden rounded-xl bg-white shadow-sm max-w-7xl mx-auto">
            <div className="flex w-1/2 flex-col gap-8 py-6 pl-10 pr-3">
              <div className="text-[44px] font-medium leading-tight tracking-tight text-gray-800">
                <strong>{young.firstName},</strong> bienvenue sur votre compte volontaire.
              </div>
              <div className="mt-2 text-xl font-bold text-[#242526]">
                Vous êtes inscrit{young?.gender === "female" && "e"} sur liste complémentaire pour le séjour {COHESION_STAY_LIMIT_DATE[young.cohort]}.
              </div>

              <hr className="text-gray-200" />
              <div className="flex gap-5">
                <Clock className="text-gray-600 flex-1 rounded-full bg-gray-100 p-2" />
                <div className="flex-1 text-sm leading-5 text-gray-500 space-y-6">
                  <Content showLinks={cohort?.uselessInformation?.showChangeCohortButtonOnHomeWaitingList} />
                </div>
              </div>
              <hr className="text-gray-200" />
            </div>
            <img className="w-1/2 object-fill" src={Img3} />
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
            <div className="flex gap-2 my-2">
              <Clock className="text-gray-600 rounded-full bg-gray-100 p-2" />
              <div className="flex-1 text-sm leading-5 text-gray-500 space-y-4">
                <Content showLinks={cohort?.uselessInformation?.showChangeCohortButtonOnHomeWaitingList} />
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
          <img className="object-contain" src={Img2} />
        </div>
      </div>
    </>
  );
}

function Content(showLinks) {
  if (showLinks) {
    return (
      <>
        <p>
          Des places peuvent se libérer à tout moment. Si vous le souhaitez, vous pouvez donc être convoqué(e) dans les prochains jours et jusqu’à l’avant-veille du départ en
          séjour. Pour cela, vous n’avez rien à faire : restez inscrit à ce séjour.
        </p>
        <p>
          Par contre, si vous ne souhaitez pas recevoir une convocation tardive, vous pouvez choisir de vous{" "}
          <LinkInline to="/changer-de-sejour">positionner sur un séjour à venir</LinkInline> ou bien{" "}
          <LinkInline to="account/general?desistement=1">retirer votre candidature</LinkInline>.
        </p>
      </>
    );
  }
  return <p>Votre inscription au SNU est bien validée. Nous vous recontacterons dès qu’une place se libère dans les prochains jours.</p>;
}
