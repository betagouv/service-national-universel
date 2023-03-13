import React from "react";
import { youngCanChangeSession } from "snu-lib";
import hero from "../../assets/hero.png";
import heroBanner from "../../assets/hero-banner.png";
import CurvedArrowLeft from "../../assets/icons/CurvedArrowLeft";
import DiscoverStay from "../../assets/icons/DiscoverStay";
import WaitFor from "../../assets/icons/WaitFor";
import ButtonLinkPrimary from "../../components/ui/buttons/ButtonLinkPrimary";
import { environment, supportURL } from "../../config";
import { translateCohort } from "../../utils";
import ChangeStayLink from "./components/ChangeStayLink";
import CheckYourSpamSection from "./components/CheckYourSpamSection";
import Container from "./components/Container";
import FaqSection from "./components/FaqSection";
import TestimonialsSection from "./components/TestimonialsSection";
import Files from "./Files";
import clock from "../../assets/clock.svg";

export default function WaitingAffectation({ young }) {
  return (
    <>
      {environment === "production" ? (
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
      ) : (
        <>
          <div className="block md:hidden relative bg-white z-[1] -mb-4">
            <img src={heroBanner} />
          </div>
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
              <img src={hero} className="hidden md:block" />
            </section>
            <Files young={young} />
            <hr className="w-full mt-12 mb-7 mx-auto" />
            <CheckYourSpamSection />
            <FaqSection />
            <TestimonialsSection />
            <section className="mt-32 pb-32">
              <h2 className="text-xl font-bold mb-8 text-center">Envie d&apos;en savoir plus sur le séjour de cohésion ?</h2>
              <div className="flex justify-center">
                <ButtonLinkPrimary href="https://www.snu.gouv.fr/phase-1-sejour-cohesion/" rel="noreferrer" className="w-52">
                  Découvrir
                </ButtonLinkPrimary>
              </div>
              <div className="relative">
                <div className="absolute rotate-180 md:rotate-0 w-fit top-5 left-10 md:left-auto md:top-auto md:right-[288px] lg:right-[308px] xl:right-[348px] 2xl:right-[408px] md:bottom-[-10px]">
                  <CurvedArrowLeft />
                </div>
                <div className="absolute top-4 left-24 md:left-auto md:top-auto md:right-[128px] lg:right-[168px] xl:right-[188px] 2xl:right-[248px]">
                  <DiscoverStay />
                </div>
              </div>
            </section>
            <div className="thumb" />
          </Container>
        </>
      )}
    </>
  );
}
