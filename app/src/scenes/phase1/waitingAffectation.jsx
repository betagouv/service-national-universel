import React from "react";
import { getDepartureDate, getReturnDate, getCohortPeriod, transportDatesToString, youngCanChangeSession } from "snu-lib";
import hero2 from "../../assets/hero-2.png";
import heroBanner from "../../assets/hero-banner.png";
import CurvedArrowLeft from "../../assets/icons/CurvedArrowLeft";
import DiscoverStay from "../../assets/icons/DiscoverStay";
import WaitFor from "../../assets/icons/WaitFor";
import ChangeStayLink from "./components/ChangeStayLink";
import CheckYourSpamSection from "./components/CheckYourSpamSection";
import Container from "./components/Container";
import FaqSection from "./components/FaqWaitingAffectation";
import TestimonialsSection from "./components/TestimonialsSection";
import Files from "./Files";
import ButtonExternalLinkPrimary from "../../components/ui/buttons/ButtonExternalLinkPrimary";
import { getCohort } from "../../utils/cohorts";
import { useSelector } from "react-redux";
import BannerTermJuly from "./components/BannerTermJuly";
import { YOUNG_SOURCE } from "snu-lib";
import { RiInformationFill } from "react-icons/ri";

export default function WaitingAffectation() {
  const young = useSelector((state) => state.Auth.young);
  const isCle = YOUNG_SOURCE.CLE === young.source;
  const cohort = getCohort(young.cohort);
  const departureDate = cohort ? getDepartureDate(young, {}, cohort) : null;
  const returnDate = cohort ? getReturnDate(young, {}, cohort) : null;
  const allowedGrades = ["TermGT", "TermPro"];

  return (
    <>
      <div className="relative z-[1] -mb-4 block bg-white md:hidden">
        <img src={heroBanner} />
      </div>
      <Container>
        <section className="mb-8 flex flex-col-reverse items-center justify-between lg:mb-11 lg:flex-row lg:items-center">
          <article>
            <h1 className="mb-4 flex flex-col text-2xl leading-7 md:gap-3 md:text-[44px] md:text-5xl md:leading-12">
              <span>Mon séjour de cohésion</span>
              <strong className="flex items-center">{cohort ? transportDatesToString(departureDate, returnDate) : getCohortPeriod(young.cohort)}</strong>
            </h1>
            {!isCle ? (youngCanChangeSession(young) ? <ChangeStayLink className="mb-7 md:mb-[42px]" /> : null) : (<div className="mt-20"></div>)}
            {allowedGrades.includes(young.grade) && (
              <BannerTermJuly responsive={"flex items-start justify-center max-w-[688px] mb-2 border-[1px] bg-white border-gray-200 rounded-lg shadow-sm lg:items-center"} />
            )}
            <div className="flex max-w-[688px] items-center gap-4 rounded-lg border-[1px] border-gray-200 bg-white p-[22px] drop-shadow">
              <div className="hidden h-[42px] w-[42px] md:block">
                <WaitFor />
              </div>
              <div>
                <div className="mb-[1rem] flex items-center gap-4 md:mb-1">
                  <div className="md:hidden">
                    <WaitFor />
                  </div>
                  <h2 className="m-0 text-lg font-bold">Vous êtes en attente d&apos;affectation à un centre</h2>
                </div>
                <p className="text-sm">
                  {isCle ? (
                    <>Votre affectation vous sera communiquée par votre établissement scolaire.</>
                  ) : (
                    <>
                      Votre affectation vous sera communiquée <strong className="font-bold">dans les semaines qui précèdent le départ</strong> par mail. En attendant, commencez à
                      préparer votre fiche sanitaire ci-dessous !
                    </>
                  )}
                </p>
              </div>
            </div>
            <div className="bg-[#EFF6FF] flex items-center justify-center max-w-[688px] text-sm leading-5 p-3 mt-2">
              <RiInformationFill className="text-xl text-[#60A5FA]" />
              <p className="text-[#1E40AF] ml-2">Vous n’êtes plus disponible pour le séjour de cohésion ? Prévenez au plus vite votre référent classe.</p>
            </div>
          </article>
          <img src={hero2} className="-mr-4 hidden md:block" width={344} />
        </section>
        <Files young={young} />
        <hr className="mx-auto mt-12 mb-7 w-full" />
        <CheckYourSpamSection />
        {!isCle ?? <FaqSection />}
        <TestimonialsSection />
        <section className="mt-12 pb-32 md:mt-32">
          <h2 className="mb-8 text-center text-xl font-bold">Envie d&apos;en savoir plus sur le séjour de cohésion ?</h2>
          <div className="flex justify-center">
            <ButtonExternalLinkPrimary href="https://www.snu.gouv.fr/phase-1-sejour-cohesion/" target="_blank" rel="noreferrer" className="w-52">
              Découvrir
            </ButtonExternalLinkPrimary>
          </div>
          <div className="relative">
            <div className="absolute top-5 left-10 w-fit rotate-180 md:left-auto md:top-auto md:right-[288px] md:bottom-[-10px] md:rotate-0 lg:right-[308px] xl:right-[348px] 2xl:right-[408px]">
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
