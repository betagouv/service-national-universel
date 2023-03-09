import React from "react";
import { youngCanChangeSession } from "snu-lib";
import clock from "../../assets/clock.svg";
import hero from "../../assets/hero.png";
import { supportURL } from "../../config";
import { translateCohort } from "../../utils";
import ChangeStayLink from "./components/ChangeStayLink";
import Container from "./components/Container";
import Files from "./Files";

export default function WaitingAffectation({ young }) {
  return (
    <>
      <Container>
        <section className="flex flex-col-reverse items-center lg:flex-row lg:items-center mb-8 lg:mb-0">
          <article>
            <h1 className="text-3xl md:text-5xl mb-4">
              Mon séjour de cohésion
              <br />
              <strong className="flex items-center">{translateCohort(young.cohort)}</strong>
            </h1>
            {youngCanChangeSession(young) ? <ChangeStayLink className="mb-7 md:mb-[42px]" /> : null}
            <p className="text-gray-600 text-base md:text-xl">
              Le SNU vous donne l&apos;opportunité de découvrir la vie collective au sein d&apos;un centre accueillant environ 200 jeunes pour créer ainsi des liens nouveaux et
              développer votre culture de l&apos;engagement et ainsi affirmer votre place dans la société.
            </p>
          </article>
          <img src={hero} />
        </section>
        <Files young={young} />
        <hr className="max-w-[95%] my-8 mx-auto" />
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
    </>
  );
}
