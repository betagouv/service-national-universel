import React from "react";
import styled from "styled-components";
import { HeroContainer, Hero } from "../../components/Content";
import { translateCohort, FILE_STATUS_PHASE1, translateFileStatusPhase1 } from "../../utils";
import { environment, supportURL } from "../../config";
import NextStep from "./nextStep";
import Files from "./Files";
import { Link } from "react-router-dom";
import { youngCanChangeSession } from "snu-lib";
import Container from "./components/Container";
import hero from "../../assets/hero.png";
import clock from "../../assets/clock.svg";
import edit from "../../assets/editIcon.svg";

export default function WaitingAffectation({ young }) {
  return (
    <>
      {environment !== "production" ? (
        <Container>
          <section className="flex flex-col-reverse items-center lg:flex-row lg:items-center">
            <article>
              <h1 className="text-3xl md:text-5xl mb-4">
                Mon séjour de cohésion
                <br />
                <strong className="flex items-center">
                  {translateCohort(young.cohort)}{" "}
                  {youngCanChangeSession({ cohort: young.cohort, status: young.statusPhase1 }) ? (
                    <Link to="/changer-de-sejour">
                      <img src={edit} alt="edit icon" className="h-9 w-9 ml-2 hover:w-10 hover:h-10 hover:cursor-pointer" />
                    </Link>
                  ) : null}
                </strong>
              </h1>
              <p className="text-gray-600 text-base md:text-xl">
                Le SNU vous donne l&apos;opportunité de découvrir la vie collective au sein d&apos;un centre accueillant environ 200 jeunes de votre région pour créer ainsi des
                liens nouveaux et développer votre culture de l’engagement et ainsi affirmer votre place dans la société.
              </p>
            </article>
            <img src={hero} />
          </section>
          <Files young={young} />
          <Divider />
          <section className="flex items-center">
            <img src={clock} />
            <article className="ml-4">
              <strong className="text-xl">Vous êtes en attente d&apos;affectation à un centre</strong>
              <br />
              <span className="text-gray-500">
                Votre affectation vous sera communiquée dans les semaines qui précèdent le départ par mail. Pensez à vérifier vos spams et courriers indésirables pour vous assurer
                que vous recevez bien les communications de la plateforme. Vous pouvez d&apos;ores et déjà préparer votre venue en consultant les{" "}
                <a className="text-indigo-600 underline hover:text-indigo-800" href={`${supportURL}/base-de-connaissance/phase-1-1-1`} target="_blank" rel="noreferrer">
                  articles à propos de la Phase 1
                </a>
                . Merci de votre patience. L&apos;équipe SNU
              </span>
            </article>
          </section>
          <div className="thumb" />
        </Container>
      ) : (
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
                  Le SNU vous donne l&apos;opportunité de découvrir la vie collective au sein d&apos;un centre accueillant environ 200 jeunes de votre région pour créer ainsi des
                  liens nouveaux et développer votre culture de l’engagement et ainsi affirmer votre place dans la société.
                </p>
                {youngCanChangeSession({ cohort: young.cohort, status: young.statusPhase1 }) ? (
                  <Button to="/changer-de-sejour">Changer mes dates de séjour de cohésion</Button>
                ) : null}
                <Divider />
                <p>
                  <strong style={{ color: "#000" }}>Vous êtes en attente d&apos;affectation à un centre</strong>
                  <br />
                  <span style={{ fontSize: "1rem" }}>
                    Votre affectation vous sera communiquée dans les semaines qui précèdent le départ par mail. Pensez à vérifier vos spams et courriers indésirables pour vous
                    assurer que vous recevez bien les communications de la plateforme. Vous pouvez d&apos;ores et déjà préparer votre venue en consultant les{" "}
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
      )}
    </>
  );
}

const Divider = styled.hr`
  max-width: 95%;
  margin: 2rem auto;
`;

const Button = styled(Link)`
  width: fit-content;
  cursor: pointer;
  color: #374151;
  text-align: center;
  margin: 1rem 0;
  background-color: #fff;
  padding: 0.5rem 1rem;
  border: 1px solid #d2d6dc;
  outline: 0;
  border-radius: 6px;
  font-weight: 500;
  font-size: 1rem;
  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
  display: block;
  outline: 0;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  position: relative;
  z-index: 2;
  :hover {
    opacity: 0.9;
  }
  a {
    color: #374151;
  }
`;
