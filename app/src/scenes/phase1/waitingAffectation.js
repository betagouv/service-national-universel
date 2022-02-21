import React from "react";
import styled from "styled-components";
import { HeroContainer, Hero } from "../../components/Content";
import { translateCohort } from "../../utils";
import { supportURL } from "../../config";
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
              <span style={{ fontSize: "1rem" }}>
                Votre affectation vous sera communiquée dans les prochains jours par mail. Pensez à vérifier vos spams et courriers indésirables pour vous assurer que vous recevez
                bien les communications de la plateforme. Vous pouvez d&apos;ores et déjà préparer votre venue en consultant les{" "}
                <a href={`${supportURL}/base-de-connaissance/phase-1-1-1`} target="_blank" rel="noreferrer">
                  articles à propos de la Phase 1
                </a>
                . <br />
                Merci de votre patience. L&apos;équipe SNU
              </span>
            </p>
          </div>
          <div className="thumb" />
        </Hero>
      </HeroContainer>
      <h2 className="text-stone-500 m-auto text-center">Documents à renseigner</h2>
      <NextStep />
    </>
  );
}

const Divider = styled.hr`
  width: 100px;
  margin: 2rem 0;
`;
