import React from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { YOUNG_STATUS_PHASE1 } from "snu-lib";
import Clock from "../../assets/icons/Clock";
import DiscoverStayWithArrow from "../../assets/icons/DiscoverStayWithArrow";
import ButtonPrimary from "../../components/ui/buttons/ButtonPrimary";

import plausibleEvent from "../../services/plausible";

export default function ValidatedV2() {
  const young = useSelector((state) => state.Auth.young);
  const history = useHistory();

  return (
    <>
      {/* DESKTOP */}
      <div className="hidden lg:flex">
        <div className="my-12 mx-10 w-full">
          <div className="flex justify-between items-center rounded-lg bg-white ">
            <div className="w-1/2 pl-10 py-6">
              <div className="text-[48px] font-medium leading-tight tracking-tight text-gray-800">
                <strong>{young.firstName},</strong> bienvenue sur votre compte volontaire.
              </div>
              <div className="left-7 text-[#242526] font-bold mt-3">Félicitations, vous allez pouvoir débuter prochainement votre parcours SNU.</div>
              <div className="flex items-center mt-4 ">
                <div className="h-8 w-8">
                  <Clock />
                </div>
                <div className="left-7 text-[#738297] ml-2">
                  {young.statusPhase1 === YOUNG_STATUS_PHASE1.WAITING_LIST
                    ? "Vous êtes sur liste complémentaire pour le séjour de cohésion"
                    : "Vous êtes actuellement en attente d’affectation à un lieu pour votre séjour de cohésion."}
                </div>
              </div>
              <div className="flex items-start mt-5">
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
            <img className="w-1/2 object-fill" src={require("../../assets/homePhase2Desktop.png")} />
          </div>
        </div>
      </div>
      {/* MOBILE */}
      <div className="flex lg:hidden w-full">
        <div className="flex flex-col-reverse ">
          <div className="px-4 pb-4">
            <div className="text-3xl font-medium leading-tight tracking-tight text-gray-800">
              <strong>{young.firstName},</strong> bienvenue sur votre compte volontaire.
            </div>
            <div className="left-7 text-[#242526] font-bold mt-3">Félicitations, vous allez pouvoir débuter prochainement votre parcours SNU.</div>
            <div className="flex items-center mt-4 ">
              <div className="h-8 w-8">
                <Clock />
              </div>
              <div className="left-7 text-[#738297] text-sm ml-2">
                {young.statusPhase1 === YOUNG_STATUS_PHASE1.WAITING_LIST
                  ? "Vous êtes sur liste complémentaire pour le séjour de cohésion"
                  : "Vous êtes actuellement en attente d’affectation à un lieu pour votre séjour de cohésion."}
              </div>
            </div>
            <ButtonPrimary
              className="w-full mt-3"
              onClick={() => {
                plausibleEvent("Phase1/CTA - Fill documents");
                history.push("/phase1");
              }}>
              Préparer mon séjour
            </ButtonPrimary>
          </div>
          <img src={require("../../assets/homePhase2Mobile.png")} />
        </div>
      </div>
    </>
  );
}
