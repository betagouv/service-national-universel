import React from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import Clock from "../../assets/icons/Clock";
import PrepareSejour from "../../assets/icons/PrepareSejour";

import plausibleEvent from "../../services/plausible";

export default function WaitingPhase1() {
  const young = useSelector((state) => state.Auth.young);
  const history = useHistory();

  return (
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
            <div className="left-7 text-[#738297] text-sm ml-2">Vous êtes actuellement en attente d’affectation à un lieu pour votre séjour de cohésion.</div>
          </div>
          <button
            className="w-full rounded-[10px] border-[1px] py-2.5 px-3  bg-blue-600 hover:bg-white border-blue-600 mt-3 text-white hover:!text-blue-600 text-sm leading-5 transition ease-in-out duration-150"
            onClick={() => {
              plausibleEvent("Phase1/CTA - Fill documents");
              history.push("/phase1");
            }}>
            Fournir mes documents justificatifs
          </button>
          <div className="ml-28 mt-2">
            <PrepareSejour />
          </div>
        </div>
        <img src={require("../../assets/homePhase2Mobile.png")} />
      </div>
    </div>
  );
}
