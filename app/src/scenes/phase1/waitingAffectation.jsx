import React from "react";
import { Link } from "react-router-dom";
import hero from "../../assets/hero/phase1.png";
import CurvedArrowLeft from "../../assets/icons/CurvedArrowLeft";
import DiscoverStay from "../../assets/icons/DiscoverStay";
import CheckYourSpamSection from "./components/CheckYourSpamSection";
import HomeContainer from "@/components/layout/HomeContainer";
import HomeHeader from "@/components/layout/HomeHeader";
import FaqSection from "./components/FaqWaitingAffectation";
import TestimonialsSection from "./components/TestimonialsSection";
import Files from "./Files";
import ButtonExternalLinkPrimary from "../../components/ui/buttons/ButtonExternalLinkPrimary";
import useAuth from "@/services/useAuth";
import { RiInformationFill } from "react-icons/ri";
import useCohort from "@/services/useCohort";
import plausibleEvent from "@/services/plausible";
import { HiArrowRight } from "react-icons/hi";
import Notice from "@/components/ui/alerts/Notice";

export default function WaitingAffectation() {
  const { young, isCLE } = useAuth();
  const { cohortDateString } = useCohort();
  const title = `Mon séjour de cohésion ${cohortDateString}`;
  const text = isCLE
    ? "Votre affectation vous sera communiquée par votre établissement scolaire."
    : "Votre affectation vous sera communiquée dans les semaines qui précèdent le départ par mail. En attendant, commencez à préparer votre fiche sanitaire ci-dessous !";

  function handleClick() {
    plausibleEvent("CLE attente affectation - desistement");
  }

  return (
    <HomeContainer>
      <HomeHeader title={title} img={hero}>
        <Link to="/changer-de-sejour">
          <p className="mt-3 text-sm text-blue-600">
            Je ne suis plus disponible <HiArrowRight className="inline-block" />
          </p>
        </Link>
        <br />
        <br />
        <Notice>
          <p className="font-bold">Vous êtes en attente d'affectation à un centre</p>
          <p>{text}</p>
        </Notice>
        {isCLE && (
          <div className="bg-blue-50 rounded-xl xl:flex text-center text-sm p-3 mt-4 gap-2">
            <div>
              <RiInformationFill className="text-xl text-blue-400 inline-block mr-2 align-bottom" />
              <span className="text-blue-800 font-semibold">Vous n’êtes plus disponible ?</span>
            </div>
            <Link
              to={{
                pathname: "/changer-de-sejour/se-desister",
                state: { backlink: "/phase1" },
              }}
              className="text-blue-600 underline underline-offset-2"
              onClick={handleClick}>
              Se désister du SNU.
            </Link>
          </div>
        )}
      </HomeHeader>
      <br />
      <br />
      <Files young={young} />
      <hr className="mx-auto mt-12 mb-7 w-full" />
      <CheckYourSpamSection />
      {!isCLE && <FaqSection />}
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
    </HomeContainer>
  );
}
