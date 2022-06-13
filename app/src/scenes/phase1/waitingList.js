import React from "react";
import { Link } from "react-router-dom";
import { youngCanChangeSession } from "snu-lib";
import clock from "../../assets/clock.svg";
import edit from "../../assets/editIcon.svg";
import hero from "../../assets/hero.png";
import { supportURL } from "../../config";
import { translateCohort } from "../../utils";
import Container from "./components/Container";
import Files from "./Files";

export default function WaitingList({ young }) {
  return (
    <>
      <Container>
        <section className="flex flex-col-reverse items-center lg:flex-row lg:items-center">
          <article>
            <h1 className="text-3xl md:text-5xl mb-4">
              Mon séjour de cohésion
              <br />
              <strong className="flex items-center">
                {translateCohort(young.cohort)}{" "}
                {youngCanChangeSession({ cohort: young.cohort, statusPhase1: young.statusPhase1 }) ? (
                  <Link to="/changer-de-sejour">
                    <img src={edit} alt="edit icon" className="h-9 w-9 ml-2 hover:w-10 hover:h-10 hover:cursor-pointer" />
                  </Link>
                ) : null}
              </strong>
            </h1>
            <p className="text-gray-600 text-base md:text-xl">
              Le SNU vous donne l&apos;opportunité de découvrir la vie collective au sein d&apos;un centre accueillant environ 200 jeunes de votre région pour créer ainsi des liens
              nouveaux et développer votre culture de l’engagement et ainsi affirmer votre place dans la société.
            </p>
          </article>
          <img src={hero} />
        </section>
        <Files young={young} />
        <hr className="max-w-[95%] my-8 mx-auto" />
        <section className="flex items-center">
          <img src={clock} />
          <article className="ml-4">
            <strong className="text-xl">Vous êtes sur liste complémentaire pour le séjour de cohésion</strong>
            <br />
            <span className="text-gray-500">
              Nous vous contacterons par email dès qu'une place se libèrera vous permettant de participer au séjour de cohésion, ne perdez pas espoir !<br />
              Vous pouvez consulter{" "}
              <a className="text-indigo-600 underline hover:text-indigo-800" href={`${supportURL}/base-de-connaissance/phase-1-1-1`} target="_blank" rel="noreferrer">
                les articles de notre base de connaissance a propos de la Phase 1
              </a>
              .<br />
              Merci de votre patience.
              <br />
              L&apos;équipe SNU
            </span>
          </article>
        </section>
        <div className="thumb" />
      </Container>
    </>
  );
}
