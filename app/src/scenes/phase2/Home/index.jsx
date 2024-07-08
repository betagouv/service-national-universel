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
import MesAttestations from "./components/MesAttestations";

export default function HomePhase2() {
  const { young } = useSelector((state) => state.Auth);

  return (
    <div className="bg-white pt-8 md:pt-16 pb-16">
      <header className="px-3">
        <div className="mx-auto w-80">
          <img src={EngagementSrc} alt="engagement" />
        </div>

        {young?.statusPhase2 === YOUNG_STATUS_PHASE2.VALIDATED ? (
          <>
            <h1 className="mt-6 mx-auto text-center font-bold text-4xl md:text-5xl max-w-3xl leading-tight">
              👏 {young?.firstName}, vous avez validé votre phase Engagement&nbsp;!
            </h1>
            <MesAttestations />
          </>
        ) : (
          <>
            <h1 className="mt-6 mx-auto text-center font-bold text-4xl md:text-5xl max-w-3xl leading-tight">Engagez-vous au service de la Nation&nbsp;!</h1>
            <div className="flex flex-col md:flex-row justify-center gap-4 my-6">
              <Link
                to="/mission"
                onClick={() => plausibleEvent("Phase 2/CTA - Realiser ma mission")}
                className="bg-blue-600 text-white hover:bg-blue-800 transition-colors rounded-md px-3 py-2.5 text-center">
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

        <hr className="mt-12 mb-6 md:max-w-6xl mx-auto" />
      </header>

      <MesEngagements />

      <Programs />

      <hr className="my-12 md:max-w-6xl mx-[1rem] md:mx-auto" />

      <FAQ />
    </div>
  );
}
