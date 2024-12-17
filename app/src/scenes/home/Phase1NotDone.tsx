import useAuth from "@/services/useAuth";
import React from "react";
import { Link } from "react-router-dom";
import hero from "../../assets/hero/home-not-done.png";
import Engagement from "./components/Engagement";
import HomeHeader from "@/components/layout/HomeHeader";
import HomeContainer from "@/components/layout/HomeContainer";

export default function HorsParcours() {
  const { young } = useAuth();
  const isEligible = young.frenchNationality === "true";
  const title = isEligible ? <>{young.firstName}, vous souhaitez vous inscrire sur un nouveau séjour&nbsp;?</> : <>{young.firstName}, vous n'avez pas validé votre phase 1</>;
  return (
    <HomeContainer>
      <HomeHeader title={title} img={isEligible ? hero : undefined}>
        {isEligible ? <ChangeSejourSection /> : null}
      </HomeHeader>
      <br />
      <Engagement />
    </HomeContainer>
  );
}

function ChangeSejourSection() {
  return (
    <section id="changer-de-sejour">
      <hr className="my-4" />
      <p className="font-bold leading-loose">Votre phase 1 n'a pas été validée</p>
      <p className="leading-normal text-gray-500">Pour la valider, inscrivez-vous pour participer à un séjour</p>
      <Link to="/changer-de-sejour">
        <p className="bg-blue-600 text-white w-full md:w-fit px-6 py-2.5 text-center rounded-md text-sm mt-4 hover:bg-blue-800 transition-colors">Choisir un nouveau séjour</p>
      </Link>
      <hr className="mt-6" />
    </section>
  );
}
