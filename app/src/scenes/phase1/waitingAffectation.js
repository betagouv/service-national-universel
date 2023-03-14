import React from "react";
import { youngCanChangeSession } from "snu-lib";
import hero2 from "../../assets/hero-2.png";
import heroBanner from "../../assets/hero-banner.png";
import CurvedArrowLeft from "../../assets/icons/CurvedArrowLeft";
import DiscoverStay from "../../assets/icons/DiscoverStay";
import WaitFor from "../../assets/icons/WaitFor";
import { translateCohort } from "../../utils";
import ChangeStayLink from "./components/ChangeStayLink";
import CheckYourSpamSection from "./components/CheckYourSpamSection";
import Container from "./components/Container";
import FaqSection from "./components/FaqSection";
import TestimonialsSection from "./components/TestimonialsSection";
import Files from "./Files";
import ButtonExternalLinkPrimary from "../../components/ui/buttons/ButtonExternalLinkPrimary";

export default function WaitingAffectation({ young }) {
  return (
    <>
      <div className="block md:hidden relative bg-white z-[1] -mb-4">
        <img src={heroBanner} />
      </div>
      <Container>
        <section className="flex flex-col-reverse items-center justify-between lg:flex-row lg:items-center mb-8 lg:mb-11">
          <article>
            <h1 className="text-2xl md:text-[44px] leading-7 md:leading-12 flex flex-col md:gap-3 md:text-5xl mb-4">
              <span>Mon séjour de cohésion</span>
              <strong className="flex items-center">{translateCohort(young.cohort)}</strong>
            </h1>
            {youngCanChangeSession(young) ? <ChangeStayLink className="mb-7 md:mb-[42px]" /> : null}
            <div className="bg-white drop-shadow border-[1px] border-gray-200 p-[22px] flex gap-4 items-center rounded-lg max-w-[688px]">
              <div className="hidden md:block w-[42px] h-[42px]">
                <WaitFor />
              </div>
              <div>
                <div className="flex gap-4 items-center mb-[1rem] md:mb-1">
                  <div className="md:hidden">
                    <WaitFor />
                  </div>
                  <h2 className="text-lg font-bold m-0">Vous êtes en attente d&apos;affectation à un centre</h2>
                </div>
                <p className="text-sm">
                  Votre affectation vous sera communiquée <strong className="font-bold">dans les semaines qui précèdent le départ</strong> par mail. En attendant, commencez à
                  préparer votre fiche sanitaire ci-dessous !
                </p>
              </div>
            </div>
          </article>
          <img src={hero2} className="hidden md:block -mr-4" width={344} />
        </section>
        <Files young={young} />
        <hr className="w-full mt-12 mb-7 mx-auto" />
        <CheckYourSpamSection />
        <FaqSection />
        <TestimonialsSection />
        <section className="mt-12 md:mt-32 pb-32">
          <h2 className="text-xl font-bold mb-8 text-center">Envie d&apos;en savoir plus sur le séjour de cohésion ?</h2>
          <div className="flex justify-center">
            <ButtonExternalLinkPrimary href="https://www.snu.gouv.fr/phase-1-sejour-cohesion/" target="_blank" rel="noreferrer" className="w-52">
              Découvrir
            </ButtonExternalLinkPrimary>
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
  );
}
