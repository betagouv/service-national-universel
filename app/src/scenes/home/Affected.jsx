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
        <p className="mt-6">Bonne nouvelle, vous avez été affecté à un lieu pour votre séjour de cohésion&nbsp;!</p>

        <Link to="/phase1" onClick={() => plausibleEvent("Phase1/CTA - Choose Meeting Point")}>
          <p className="mt-4 text-center md:w-fit rounded-[10px] border-[1px] border-blue-600  bg-blue-600 py-2.5 px-3 text-sm font-medium leading-5 text-white transition duration-150 ease-in-out hover:bg-white hover:!text-blue-600">
            Réaliser mes démarches pour partir
          </p>
        </Link>
      </HomeHeader>
    </HomeContainer>
  );
}
