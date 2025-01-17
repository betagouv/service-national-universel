import hero from "../../assets/hero/home.png";
import React from "react";
import { Link } from "react-router-dom";
import plausibleEvent from "../../services/plausible";
import useAuth from "@/services/useAuth";
import HomeContainer from "@/components/layout/HomeContainer";
import HomeHeader from "@/components/layout/HomeHeader";

export default function Affected() {
  const { young, isCLE } = useAuth();
  const title = `${young.firstName}, bienvenue sur votre compte ${isCLE ? "élève" : "volontaire"}.`;

  return (
    <HomeContainer>
      <HomeHeader title={title} img={hero}>
        <p className="mt-6">Bonne nouvelle, vous avez été affecté{young.gender === "female" && "e"} à un lieu pour votre séjour de cohésion&nbsp;!</p>
        <br />
        <Link to="/phase1" onClick={() => plausibleEvent("Phase1/CTA - Choose Meeting Point")}>
          <p className="text-center w-full md:w-fit rounded-md bg-blue-600 py-2 px-3 text-sm text-white transition duration-200 ease-in-out hover:bg-blue-800">
            Réaliser mes démarches pour partir
          </p>
        </Link>
      </HomeHeader>
    </HomeContainer>
  );
}
