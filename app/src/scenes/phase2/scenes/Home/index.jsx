import React, { useEffect } from "react";
import EngagementSrc from "@/assets/engagement/engagement-home.png";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import plausibleEvent from "@/services/plausible";
import { YOUNG_STATUS_PHASE2 } from "../../../../utils";
import { HiChevronDown, HiExternalLink, HiPlus, HiSearch } from "react-icons/hi";
import { EngagementList } from "./components/EngagementList";
import { Programs } from "./components/Programs";
import { FAQ } from "./components/FAQ";
import { RiAttachmentLine } from "react-icons/ri";
import DownloadMenu from "./components/DownloadMenu";
import { Popover, PopoverButton } from "@headlessui/react";
import { supportURL } from "@/config";
import Voiture from "@/assets/Voiture";
import { useLocation } from "react-router-dom";

export default function HomePhase2() {
  const { young } = useSelector((state) => state.Auth);
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.replace("#", ""));
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [hash]);

  return (
    <div className="bg-white pt-8 pb-16">
      <header className="px-3 md:pt-8 mx-auto max-w-6xl">
        <div className="mx-auto w-80">
          <img src={EngagementSrc} alt="engagement" />
        </div>

        {young?.statusPhase2 === YOUNG_STATUS_PHASE2.VALIDATED ? (
          <>
            <h1 className="mt-6 mx-auto text-center font-bold text-3xl md:text-5xl max-w-xl leading-tight md:leading-tight">
              👏 {young?.firstName}, vous avez validé votre phase Engagement&nbsp;!
            </h1>
            <h2 className="font-bold text-2xl md:text-3xl mx-0 mt-12">Mes attestations</h2>

            <div className="mt-[1rem] md:mt-[2rem] border rounded-xl p-3 mx-auto">
              <div className="grid grid-rows-2 md:grid-rows-1 md:grid-cols-2">
                <Popover className="relative group">
                  <PopoverButton className="w-full flex gap-2 md:border-r border-b md:border-b-0 pb-[0.75rem] md:pb-0 ">
                    <div className=" flex-none mt-1">
                      <RiAttachmentLine className="text-gray-400 text-xl align-bottom flex-none" />
                    </div>
                    <div>
                      <p>Attestation de réalisation phase 2</p>
                      <p className="mt-1 text-blue-600 text-left">
                        Télécharger
                        <HiChevronDown className="inline-block ml-1 transition group-data-[open]:rotate-180" />
                      </p>
                    </div>
                  </PopoverButton>
                  <DownloadMenu template="2" />
                </Popover>

                <Popover className="relative group">
                  <PopoverButton className="w-full flex gap-2 md:px-3 pt-[0.75rem] md:p-0">
                    <div className=" flex-none mt-1">
                      <RiAttachmentLine className="text-gray-400 text-xl align-bottom flex-none" />
                    </div>
                    <div>
                      <p>Attestation de réalisation SNU</p>
                      <p className="mt-1 text-blue-600 text-left">
                        Télécharger
                        <HiChevronDown className="inline-block ml-1 transition group-data-[open]:rotate-180" />
                      </p>
                    </div>
                  </PopoverButton>
                  <DownloadMenu template="snu" />
                </Popover>
              </div>
            </div>

            <a
              href={`${supportURL}/base-de-connaissance/permis-et-code-de-la-route`}
              target="_blank"
              rel="noopener noreferrer"
              className="relative mt-6 flex flex-col md:flex-row bg-white border rounded-xl p-4 gap-5 items-center">
              <div className="w-fit">
                <Voiture className="w-12 h-12" />
              </div>
              <div>
                <p className="text-gray-900 w-fit md:w-full mx-auto font-bold">N&apos;oubliez pas&nbsp;!</p>
                <p className="text-gray-500 w-fit md:w-full mx-auto mt-1 text-sm text-center md:hidden">
                  Vous bénéficiez d'une première présentation gratuite à l'examen du code de la route (sous condition d'avoir également validé votre phase 1).
                </p>
                <p className="text-gray-500 w-fit md:w-full mx-auto mt-1 text-sm text-left hidden md:block">
                  Vous bénéficiez d'une première présentation gratuite à l'examen du code de la route (sous condition d'avoir également validé votre phase 1).
                </p>
              </div>
              <div className="absolute top-5 right-5">
                <HiExternalLink className="text-xl text-gray-500 flex-none" />
              </div>
            </a>
          </>
        ) : (
          <>
            <h1 className="mt-6 mx-auto text-center font-bold text-3xl md:text-5xl max-w-xl leading-tight md:leading-tight">Engagez-vous au service de la Nation&nbsp;!</h1>
            <div className="flex flex-col md:flex-row justify-center gap-4 my-6">
              <Link
                to="/mission"
                onClick={() => plausibleEvent("Phase2/CTA - Trouver un engagement")}
                className="bg-blue-600 text-white hover:bg-blue-800 transition-colors rounded-md px-3 py-2.5 text-center line-clamp-1">
                <HiSearch className="inline-block mr-2 text-xl align-text-bottom" />
                Trouver un engagement
              </Link>
              <Link
                to="/phase2/equivalence"
                onClick={() => plausibleEvent("Phase2/CTA - Ajouter un engagement")}
                className="border rounded-md px-3 py-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-colors text-center">
                <HiPlus className="inline-block mr-2 text-xl align-text-bottom" />
                Ajouter un engagement réalisé
              </Link>
            </div>
          </>
        )}

        <hr className="mt-[2rem] md:mt-[3rem]" />
      </header>

      <section id="mes-engagements" className="bg-gradient-to-b from-white to-gray-100 pb-2">
        <div className="mx-auto max-w-6xl px-3 mt-[1rem] md:mt-[3rem] mb-[0.5rem] md:mb-[1.5rem] flex justify-between items-center">
          <h2 className="font-bold m-0 text-2xl md:text-3xl">Mes engagements</h2>
          <Link to="/phase2/mes-engagements" onClick={() => plausibleEvent("Phase2/CTA - Voir")} className="text-blue-600">
            Voir
          </Link>
        </div>
        <div className="md:mt-[1rem] max-w-6xl mx-auto">
          <EngagementList />
        </div>
      </section>

      <section id="les-programmes" className="mt-12 md:mt-24 px-4 md:px-24">
        {young.statusPhase2 === YOUNG_STATUS_PHASE2.VALIDATED ? (
          <h2 className="text-center font-bold text-2xl md:text-4xl md:leading-snug m-0 max-w-3xl mx-auto">Tous les programmes d'engagement possibles après le SNU</h2>
        ) : (
          <>
            <p className="w-fit mx-auto text-xs font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">EXPLOREZ D'AUTRES POSSIBILITES</p>

            <h2 id="sectionEngagement" className="text-center font-bold text-2xl md:text-4xl m-0 mt-2 md:mt-4">
              Trouvez un engagement par vous-même
            </h2>

            <div className="mt-6 md:mt-12 border rounded-xl p-3 max-w-3xl mx-auto">
              <div className="grid grid-rows-2 md:grid-rows-1 md:grid-cols-2 text-gray-500">
                <div className="flex gap-4 items-center md:border-r border-b md:border-b-0 px-3 pb-[0.75rem] md:pb-0">
                  <div className="rounded-full bg-blue-france-sun-113 flex items-center justify-center w-6 h-6 flex-none">
                    <p className="text-white text-xs">1</p>
                  </div>
                  <p className="line-clamp-3">
                    Candidatez à <strong className="text-gray-900">l'engagement de votre choix</strong> ci-dessous en toute autonomie
                  </p>
                </div>
                <div className="flex gap-4 items-center px-3 pt-[0.75rem] md:p-0">
                  <div className="rounded-full bg-blue-france-sun-113 flex items-center justify-center w-6 h-6 flex-none">
                    <p className="text-white text-xs">2</p>
                  </div>
                  <p className="line-clamp-3">
                    <strong className="text-gray-900">Une fois terminé</strong>,{" "}
                    <Link to="/phase2/equivalence" className="underline underline-offset-2">
                      ajoutez-le
                    </Link>{" "}
                    à vos engagements réalisés.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
        <Programs />
      </section>

      <hr className="mt-[3rem] md:max-w-6xl mx-[1rem] md:mx-auto" />

      <section id="questions-frequentes" className="px-4 md:px-24 mt-12">
        <h2 className="text-center font-bold text2xl md:text-4xl m-0 mt-12">Questions fréquentes</h2>
        <FAQ />
      </section>
    </div>
  );
}
