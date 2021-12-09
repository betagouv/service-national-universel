import React from "react";
import styled from "styled-components";
import { HeroContainer, Hero } from "../../components/Content";
import { translateCohort } from "../../utils";
import NextStep from "./nextStep";

export default function WaitingAffectation({ young }) {
  return (
    <>
      <HeroContainer>
        <Hero>
          <div className="content">
            <h1>
              <strong>Mon séjour de cohésion</strong>
              <br />
              {translateCohort(young.cohort)}
            </h1>
            <p>
              Le SNU vous donne l&apos;opportunité de découvrir la vie collective au sein d&apos;un centre accueillant environ 200 jeunes de votre région pour créer ainsi des liens
              nouveaux et développer votre culture de l’engagement et ainsi affirmer votre place dans la société.
            </p>
            <Divider />
            <p>
              <strong style={{ color: "#000" }}>Vous êtes en attente d&apos;affectation à un centre</strong>
              <br />
              Votre affectation vous sera annoncée 3 semaines avant votre départ en séjour de cohésion.
            </p>
          </div>
          <div className="thumb" />
        </Hero>
      </HeroContainer>
      <UnderTitle>Documents à renseigner</UnderTitle>
      <NextStep />
    </>
  );
}

const Divider = styled.hr`
  width: 100px;
  margin: 2rem 0;
`;

const UnderTitle = styled.h2`
  color: #6b7280;
  margin: 0.5rem auto;
  text-align: center;
`;
