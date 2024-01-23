import Img3 from "../../assets/homePhase2Desktop.png";
import Img2 from "../../assets/homePhase2Mobile.png";
import React from "react";
import { useHistory } from "react-router-dom";
import { YOUNG_STATUS_PHASE1 } from "snu-lib";
import Clock from "../../assets/icons/Clock";
import DiscoverStayWithArrow from "../../assets/icons/DiscoverStayWithArrow";
import ButtonPrimary from "../../components/ui/buttons/ButtonPrimary";
import useAuth from "@/services/useAuth";
import plausibleEvent from "../../services/plausible";

export default function ValidatedV2() {
  const { young, isCLE } = useAuth();
  const history = useHistory();

  return (
    <>
      {/* DESKTOP */}
      <div className="hidden lg:flex">
        <div className="my-12 mx-10 w-full">
          <div className="flex items-center justify-between rounded-lg bg-white ">
            <div className="w-1/2 py-6 pl-10">
              <div className="text-[48px] font-medium leading-tight tracking-tight text-gray-800">
                <strong>{young.firstName}, </strong>
                {isCLE ? "bienvenue sur votre compte élève." : "bienvenue sur votre compte volontaire."}
              </div>
              <div className="left-7 mt-3 font-bold text-[#242526]">Félicitations, vous allez pouvoir débuter prochainement votre parcours SNU.</div>
              <div className="mt-4 flex items-center ">
                <div className="h-8 w-8">
                  <Clock />
                </div>
                <div className="left-7 ml-2 text-[#738297]">
                  {young.statusPhase1 === YOUNG_STATUS_PHASE1.WAITING_LIST
                    ? "Vous êtes sur liste complémentaire pour le séjour de cohésion"
                    : "Vous êtes actuellement en attente d’affectation à un lieu pour votre séjour de cohésion."}
                </div>
              </div>
              <div className="mt-5 flex items-start">
                <ButtonPrimary
                  className="mr-2 shrink-0"
                  onClick={() => {
                    plausibleEvent("Phase1/CTA - Fill documents");
                    history.push("/phase1");
                  }}>
                  Préparer mon séjour
                </ButtonPrimary>
                <DiscoverStayWithArrow />
              </div>
            </div>
            <img className="w-1/2 object-fill" src={Img3} />
          </div>
        </div>
      </div>
      {/* MOBILE */}
      <div className="flex w-full lg:hidden">
        <div className="flex flex-col-reverse ">
          <div className="px-4 pb-4">
            <div className="text-3xl font-medium leading-tight tracking-tight text-gray-800">
              <strong>{young.firstName}, </strong>
              {isCLE ? "bienvenue sur votre compte élève." : "bienvenue sur votre compte volontaire."}
            </div>
            <div className="left-7 mt-3 font-bold text-[#242526]">Félicitations, vous allez pouvoir débuter prochainement votre parcours SNU.</div>
            <div className="mt-4 flex items-center ">
              <div className="h-8 w-8">
                <Clock />
              </div>
              <div className="left-7 ml-2 text-sm text-[#738297]">
                {young.statusPhase1 === YOUNG_STATUS_PHASE1.WAITING_LIST
                  ? "Vous êtes sur liste complémentaire pour le séjour de cohésion"
                  : "Vous êtes actuellement en attente d’affectation à un lieu pour votre séjour de cohésion."}
              </div>
            </div>
            <ButtonPrimary
              className="mt-3 w-full"
              onClick={() => {
                plausibleEvent("Phase1/CTA - Fill documents");
                history.push("/phase1");
              }}>
              Préparer mon séjour
            </ButtonPrimary>
          </div>
          <img src={Img2} />
        </div>
      </div>
    </>
  );
}
