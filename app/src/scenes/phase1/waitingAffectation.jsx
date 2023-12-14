import React from "react";
import { getCohortPeriod, youngCanChangeSession } from "snu-lib";
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
import useAuth from "@/services/useAuth";
import { RiInformationFill } from "react-icons/ri";

export default function WaitingAffectation() {
  const { young, isCLE } = useAuth();
  const shouldShowChangeStayLink = !isCLE && youngCanChangeSession(young);

  const cohortDate = getCohortPeriod(young.cohort);
  const isSejourDateAvailable = cohortDate !== young.cohort;

  return (
    <>
      <div className="relative z-[1] -mb-4 block bg-white md:hidden">
        <img src={heroBanner} />
      </div>
      <Container>
        <section className="flex justify-between">
          <div className="mb-10 max-w-3xl">
            <header className="md:mt-12 mb-12">
              <h1 className="text-[44px] mt-0 mb-1">Mon séjour de cohésion</h1>
              <h2 className="text-[44px] mt-0 mb-3 font-bold">{isSejourDateAvailable ? getCohortPeriod(young.cohort) : "à venir"}</h2>
              {shouldShowChangeStayLink && <ChangeStayLink />}
            </header>
            <div className="flex my-4 items-center gap-4 rounded-xl border-[1px] border-gray-200 bg-white p-3">
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
                  {isCLE ? (
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
            {isCLE && (
              <div className="bg-[#EFF6FF] rounded-xl flex items-center p-3 mt-4">
                <RiInformationFill className="text-[50px] md:text-xl text-[#60A5FA]" />
                <p className="text-sm text-[#1E40AF] ml-2">Vous n’êtes plus disponible pour le séjour de cohésion ? Prévenez au plus vite votre référent classe.</p>
              </div>
            )}
          </div>
          <div className="flex-none hidden md:block">
            <img src={hero2} width={344} />
          </div>
        </section>
        <Files young={young} />
        <hr className="mx-auto mt-12 mb-7 w-full" />
        <CheckYourSpamSection />
        {!isCLE ?? <FaqSection />}
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
