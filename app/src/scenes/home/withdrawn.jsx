import React from "react";
import { Link } from "react-router-dom";
import useAuth from "@/services/useAuth";
import HomeContainer from "@/components/layout/HomeContainer";
import HomeHeader from "@/components/layout/HomeHeader";
import hero from "../../assets/hero/home.png";
import { isCle, translate } from "../../utils";
import plausibleEvent from "../../services/plausible";

export default function Withdrawn() {
  const { young } = useAuth();
  const title = `${young.firstName}, dommage que vous nous quittiez !`;

  return (
    <HomeContainer>
      <HomeHeader title={title} img={hero}>
        <p className="mt-6 leading-relaxed text-gray-500">
          Votre désistement du SNU {isCle(young) && "dans le cadre des classes engagées "} a bien été pris en compte. Si l&apos;engagement vous donne envie, vous trouverez
          ci-dessous des dispositifs qui pourront vous intéresser.
        </p>
        <Link to="/les-programmes" onClick={() => plausibleEvent("CTA désisté - Autres possibilités d'engagement", { statut: translate(young.status) })}>
          <p className="mt-6 text-center md:w-fit rounded-md bg-blue-600 py-2 px-3 text-sm text-white transition duration-150 ease-in-out hover:bg-blue-800">
            Consulter les autres possibilités d&apos;engagement
          </p>
        </Link>
      </HomeHeader>
    </HomeContainer>
  );
}
