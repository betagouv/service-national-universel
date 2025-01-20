import React from "react";
import useAuth from "@/services/useAuth";
import Engagement from "./components/Engagement";
import HomeContainer from "@/components/layout/HomeContainer";
import HomeHeader from "@/components/layout/HomeHeader";
import hero from "../../assets/hero/home.png";

export default function Excluded() {
  const { young } = useAuth();
  const title = `${young.firstName}, votre séjour de cohésion n'a pas été validé pour motif d'exclusion.`;

  return (
    <HomeContainer>
      <HomeHeader title={title} img={hero}>
        <p className="mt-6 leading-relaxed">
          <strong>Vous ne pouvez donc pas poursuivre votre parcours d’engagement au sein du SNU.</strong> Nous vous proposons de découvrir les autres formes d’engagement possible.
        </p>
      </HomeHeader>
      <br />
      <Engagement />
    </HomeContainer>
  );
}
