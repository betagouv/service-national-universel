import hero from "../../assets/hero/home.png";
import React from "react";
import { Link } from "react-router-dom";
import Clock from "../../assets/icons/Clock";
import DiscoverStayWithArrow from "../../assets/icons/DiscoverStayWithArrow";
import useAuth from "@/services/useAuth";
import plausibleEvent from "../../services/plausible";
import HomeContainer from "@/components/layout/HomeContainer";
import HomeHeader from "@/components/layout/HomeHeader";

export default function WaitingAffectation() {
  const { young, isCLE } = useAuth();
  const title = isCLE ? `${young.firstName}, bienvenue sur votre compte élève.` : `${young.firstName}, bienvenue sur votre compte volontaire.`;

  return (
    <HomeContainer>
      <HomeHeader title={title} img={hero}>
        <p className="mt-6">Félicitations, vous allez pouvoir débuter prochainement votre parcours SNU.</p>

        <div className="mt-4 flex items-center ">
          <div className="h-8 w-8">
            <Clock />
          </div>
          <p className="ml-2 text-gray-500">Vous êtes actuellement en attente d’affectation à un lieu pour votre séjour de cohésion.</p>
        </div>

        <div className="mt-5 flex items-start">
          <Link to="/phase1" onClick={() => plausibleEvent("Phase1/CTA - Fill documents")}>
            <p className="text-center md:w-fit rounded-md bg-blue-600 py-2 px-3 text-sm text-white transition duration-150 ease-in-out hover:bg-blue-800">Préparer mon séjour</p>
          </Link>
          <DiscoverStayWithArrow />
        </div>
      </HomeHeader>
    </HomeContainer>
  );
}
