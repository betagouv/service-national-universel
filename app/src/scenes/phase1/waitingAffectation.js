import React from "react";
import { HeroContainer, Hero } from "../../components/Content";
import NextStep from "./nextStep";

export default () => {
  return (
    <>
      <HeroContainer>
        <Hero>
          <div className="content">
            <h1>
              <strong>Mon séjour de cohésion</strong>
            </h1>
            <p>
              Le SNU vous donne l'opportunité de découvrir la vie collective au sein d'un centre accueillant environ 200 jeunes de votre région pour créer ainsi des liens nouveaux
              et développer votre culture de l’engagement et ainsi affirmer votre place dans la société.
            </p>
          </div>
          <div className="thumb" />
        </Hero>
      </HeroContainer>
      <NextStep />
    </>
  );
};
