import React from "react";
import { Link } from "react-router-dom";
import useAuth from "@/services/useAuth";
import HomeContainer from "@/components/layout/HomeContainer";
import HomeHeader from "@/components/layout/HomeHeader";
import hero from "../../../assets/hero/phase2.png";

export default function HomePhase3() {
  const { young } = useAuth();
  const title = `${young.firstName}, votre Phase 3 est en attente de validation !`;

  return (
    <HomeContainer>
      <HomeHeader title={title} img={hero}>
        <p className="mt-4 leading-relaxed">Votre tuteur de mission doit examiner le formulaire de validation que vous avez déposé puis le confirmer.</p>
        <hr className="my-4" />
        <p>
          <strong>Suivre la validation de mon engagement prolongé</strong>
        </p>
        <p className="">Vous pouvez suivre l&apos;avancement de la validation de votre mission par votre tuteur.</p>
        <Link to="/phase3/valider">
          <p className="mt-2 text-blue-600 underline underline-offset-2">Suivre l&apos;avancement {">"}</p>
        </Link>
      </HomeHeader>
    </HomeContainer>
  );
}
