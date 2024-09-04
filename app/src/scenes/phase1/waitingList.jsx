import React from "react";
import { Link } from "react-router-dom";
import { getCohortPeriod, youngCanChangeSession } from "snu-lib";
import clock from "../../assets/clock.svg";
import edit from "../../assets/editIcon.svg";
import hero from "../../assets/hero.png";
import { supportURL } from "../../config";
import Container from "./components/Container";
import Files from "./Files";

export default function WaitingList({ young }) {
  return (
    <>
      <Container>
        <section className="flex flex-col-reverse items-center lg:flex-row lg:items-center">
          <article>
            <h1 className="mb-4 text-3xl md:text-5xl">
              Mon séjour de cohésion
              <br />
              <strong className="flex items-center">
                {getCohortPeriod(young.cohortData)}{" "}
                {youngCanChangeSession(young) ? (
                  <Link to="/changer-de-sejour">
                    <img src={edit} alt="edit icon" className="ml-2 h-9 w-9 hover:h-10 hover:w-10 hover:cursor-pointer" />
                  </Link>
                ) : null}
              </strong>
            </h1>
            <p className="text-base text-gray-600 md:text-xl">
              Le SNU vous donne l&apos;opportunité de découvrir la vie collective au sein d&apos;un centre accueillant environ 200 jeunes de votre région pour créer ainsi des liens
              nouveaux et développer votre culture de l’engagement et ainsi affirmer votre place dans la société.
            </p>
          </article>
          <img src={hero} />
        </section>
        <Files young={young} />
        <hr className="my-8 mx-auto max-w-[95%]" />
        <section className="flex items-center">
          <img src={clock} />
          <article className="ml-4">
            <strong className="text-xl">Vous êtes sur liste complémentaire pour le séjour de cohésion</strong>
            <br />
            <span className="text-gray-500">
              Une place peut se libérer dans les prochains jours : nous vous en avertirons. Vous pouvez également choisir de vous inscrire sans attendre sur un autre séjour sur
              lequel il reste de la place. Vous pouvez consulter les{" "}
              <a className="text-indigo-600 underline hover:text-indigo-800" href={`${supportURL}/base-de-connaissance/phase-1-1-1`} target="_blank" rel="noreferrer">
                articles de notre base de connaissance a propos de la Phase 1.
              </a>
            </span>
          </article>
        </section>
        <div className="thumb" />
      </Container>
    </>
  );
}
