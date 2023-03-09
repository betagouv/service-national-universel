import React from "react";
import { youngCanChangeSession } from "snu-lib";
import clock from "../../assets/clock.svg";
import hero from "../../assets/hero.png";
import CurvedArrowLeft from "../../assets/icons/CurvedArrowLeft";
import DiscoverStay from "../../assets/icons/DiscoverStay";
import WaitFor from "../../assets/icons/WaitFor";
import ButtonPrimary from "../../components/ui/buttons/ButtonPrimary";
import { supportURL } from "../../config";
import { translateCohort } from "../../utils";
import ChangeStayLink from "./components/ChangeStayLink";
import CheckYourSpamSection from "./components/CheckYourSpamSection";
import Container from "./components/Container";
import FaqSection from "./components/FaqSection";
import TestimonialsSection from "./components/TestimonialsSection";
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
            <div className="bg-white drop-shadow border-[1px] border-gray-200 p-6 flex gap-4 items-center rounded-lg">
              <div className="w-[42px] h-[42px]">
                <WaitFor />
              </div>
              <div>
                <h2 className="text-lg font-bold m-0 mb-1">Vous êtes en attente d&apos;affectation à un centre</h2>
                <p className="text-sm">
                  Votre affectation vous sera communiquée <strong className="font-bold">dans les semaines qui précèdent le départ</strong> par mail. En attendant, commencez à
                  préparer votre fiche sanitaire ci-dessous !
                </p>
              </div>
            </div>
          </article>
          <img src={hero} />
        </section>
        <Files young={young} />
        <hr className="w-full mt-12 mb-7 mx-auto" />
        <CheckYourSpamSection />
        <FaqSection />
        <TestimonialsSection />
        {/* <section className="flex items-center">
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
        </section> */}
        <section className="mt-32 relative pb-32">
          <h2 className="text-xl font-bold mb-8 text-center">Envie d&apos;en savoir plus sur le séjour de cohésion ?</h2>
          <div className="flex justify-center">
            <ButtonPrimary className="w-52">Découvrir</ButtonPrimary>
          </div>
          <div className="absolute left-10 md:left-auto md:right-[150px] xl:right-[180px] 2xl:right-[208px] bottom-0 md:bottom-[40px]">
            <div className="rotate-180 md:rotate-0 w-fit">
              <CurvedArrowLeft />
            </div>
            <DiscoverStay />
          </div>
        </section>
        <div className="thumb" />
      </Container>
    </>
  );
}
