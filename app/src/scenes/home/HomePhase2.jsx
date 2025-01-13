import React from "react";
import useAuth from "@/services/useAuth";
import { Link } from "react-router-dom";
import plausibleEvent from "../../services/plausible";
import HomeContainer from "@/components/layout/HomeContainer";
import HomeHeader from "@/components/layout/HomeHeader";
import hero from "../../assets/hero/home.png";

export default function HomePhase2() {
  const { young } = useAuth();
  const title = `${young.firstName}, ${young.gender === "female" ? "prête " : "prêt "} pour la phase engagement ?`;

  return (
    <HomeContainer>
      <HomeHeader title={title} img={hero}>
        <p className="mt-6 leading-relaxed">
          Mettez votre énergie au service d&apos;une société plus solidaire et découvrez votre talent pour l&apos;engagement en réalisant une mission d&apos;intérêt général ou en
          rejoignant un programme d’engagement.
        </p>

        <div className="grid grid-cols-1 mt-8 gap-2 md:max-w-xs">
          <Link
            to="/phase2"
            className="text-center rounded-[10px] border-[1px] border-blue-600 bg-blue-600 py-2.5 px-3 text-sm font-medium leading-5 text-white transition duration-150 ease-in-out hover:bg-white hover:!text-blue-600"
            onClick={() => plausibleEvent("Phase 2/CTA - Realiser ma mission")}>
            Je m&apos;engage
          </Link>

          <Link
            to="/phase1"
            className="text-center rounded-[10px] border-[1px] border-blue-600 bg-white py-2.5 px-3 text-sm font-medium leading-5 text-blue-600 transition duration-150 ease-in-out hover:!bg-blue-600 hover:!text-white">
            Voir les détails de ma phase 1
          </Link>
        </div>
      </HomeHeader>
    </HomeContainer>
  );
}
