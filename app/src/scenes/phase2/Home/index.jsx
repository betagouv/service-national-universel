import React from "react";
import EngagementSrc from "../../../assets/engagement/engagement-home.png";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import plausibleEvent from "../../../services/plausible";
import { YOUNG_STATUS_PHASE2 } from "../../../utils";
import { HiPlus, HiSearch } from "react-icons/hi";
import { MesEngagements } from "./components/MesEngagement";
import { Programs } from "./components/Programs";
import { FAQ } from "./components/FAQ";

export default function HomePhase2() {
  const { young } = useSelector((state) => state.Auth);

  return (
    <div className="bg-white pt-8 pb-16">
      <header className="px-3 md:pt-8 mx-auto max-w-6xl">
        <div className="mx-auto w-80">
          <img src={EngagementSrc} alt="engagement" />
        </div>

        {young?.statusPhase2 === YOUNG_STATUS_PHASE2.VALIDATED ? (
          <h1 className="mt-6 mx-auto text-center font-bold text-4xl md:text-5xl max-w-xl leading-tight md:leading-tight">
            👏 {young?.firstName}, vous avez validé votre phase Engagement&nbsp;!
          </h1>
        ) : (
          <>
            <h1 className="mt-6 mx-auto text-center font-bold text-4xl md:text-5xl max-w-xl leading-tight md:leading-tight">Engagez-vous au service de la Nation&nbsp;!</h1>
            <div className="flex flex-col md:flex-row justify-center gap-4 my-6">
              <Link
                to="/mission"
                onClick={() => plausibleEvent("Phase 2/CTA - Realiser ma mission")}
                className="bg-blue-600 text-white hover:bg-blue-800 transition-colors rounded-md px-3 py-2.5 text-center line-clamp-1">
                <HiSearch className="inline-block mr-2 text-xl" />
                Trouver un engagement
              </Link>
              <Link to="/phase2/equivalence" className="border rounded-md px-3 py-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-colors text-center">
                <HiPlus className="inline-block mr-2 text-xl" />
                Ajouter un engagement réalisé
              </Link>
            </div>
          </>
        )}

        <hr className="mt-[1rem] md:mt-[3rem]" />
      </header>

      <section className="bg-gradient-to-b from-white to-gray-100 pb-2">
        <div className="mx-auto max-w-6xl px-3 mt-[1rem] md:mt-[3rem] mb-[0.5rem] md:mb-[1.5rem] flex justify-between items-center">
          <h2 className="font-bold m-0 text-2xl md:text-4xl">Mes engagements</h2>
          <Link to="/phase2/mig" className="text-blue-600">
            Voir
          </Link>
        </div>
        <MesEngagements />
      </section>

      <section className="mt-12 md:mt-24 px-4 md:px-24">
        <p className="w-fit mx-auto text-xs font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">EXPLOREZ D'AUTRES POSSIBILITES</p>

        <h2 className="text-center font-bold text2xl md:text-4xl m-0 mt-2 md:mt-4">Trouvez un engagement par vous-même</h2>

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
        <Programs />
      </section>

      <hr className="mt-24 md:max-w-5xl mx-[1rem] md:mx-auto" />

      <section className="px-4 md:px-24 mt-12">
        <h2 className="text-center font-bold text2xl md:text-4xl m-0 mt-12">Questions fréquentes</h2>
        <FAQ />
      </section>
    </div>
  );
}
