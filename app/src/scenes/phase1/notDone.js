import React from "react";
import { useSelector } from "react-redux";
import { HeroContainer, Hero } from "../../components/Content";

export default () => {
  const young = useSelector((state) => state.Auth.young) || {};

  return (
    <HeroContainer>
      <Hero>
        <div className="content">
          <h1>
            <strong>{young.firstName}, vous n'avez pas réalisé votre séjour de cohésion !</strong>
          </h1>
          <p>
            <b>Votre phase 1 n'est donc pas validée.</b>
          </p>
          <p>Nous vous invitons à vous rapprocher de votre référent déparemental pour la suite de votre parcours.</p>
        </div>
        <div className="thumb" />
      </Hero>
    </HeroContainer>
  );
};
