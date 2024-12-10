import useAuth from "@/services/useAuth";
import React from "react";
import { Link } from "react-router-dom";
import hero from "../../assets/hero/home-not-done.png";
import Engagement from "./components/Engagement";
import HomeContainer from "@/components/layout/HomeContainer";

export default function HorsParcours() {
  const { young } = useAuth();
  return (
    <HomeContainer title={<>{young.firstName}, vous souhaitez vous inscrire sur un nouveau séjour&nbsp;?</>} img={hero}>
      <hr className="my-4" />
      <p className="font-bold leading-loose">Votre phase 1 n'a pas été validée</p>
      <p className="leading-normal text-gray-500">Pour la valider, inscrivez-vous pour participer à un séjour</p>
      <Link to="/changer-de-sejour">
        <div className="bg-blue-600 text-white w-full text-center rounded-md text-sm p-2.5 mt-4 hover:bg-blue-800 transition-colors">Choisir un nouveau séjour</div>
      </Link>
      <hr className="my-6" />
      <Engagement />
    </HomeContainer>
  );
}
