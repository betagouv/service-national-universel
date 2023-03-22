import React from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

import plausibleEvent from "../../services/plausible";

export default function Affected() {
  const young = useSelector((state) => state.Auth.young);
  const history = useHistory();

  return (
    <>
      {/* DESKTOP */}
      <div className="hidden lg:flex">
        <div className="my-12 mx-10 w-full">
          <div className="flex justify-between items-center rounded-lg bg-white ">
            <div className="w-1/2 pl-10 pt-6 py-6">
              <div className="text-[48px] font-medium leading-tight tracking-tight text-gray-800">
                <strong>{young.firstName},</strong> bienvenue sur votre compte volontaire.
              </div>
              <div className="left-7 text-[#242526] font-bold mt-3">Bonne nouvelle vous avez été affecté à un lieu pour votre séjour de cohésion !</div>
              <div className="flex flex-col items-stretch w-fit">
                <button
                  className="rounded-[10px] border-[1px] py-2.5 px-3  bg-blue-600 hover:bg-white border-blue-600 mt-5 text-white hover:!text-blue-600 text-sm leading-5 font-medium transition ease-in-out duration-150"
                  onClick={() => {
                    plausibleEvent("Phase1/CTA - Choose Meeting Point");
                    history.push("/phase1");
                  }}>
                  Réaliser mes démarches pour partir
                </button>
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
            <div className="left-7 text-[#242526] font-bold mt-3">Bonne nouvelle vous avez été affecté à un lieu pour votre séjour de cohésion !</div>
            <button
              className="w-full rounded-[10px] border-[1px] py-2.5 px-3  bg-blue-600 hover:bg-white border-blue-600 mt-3 text-white hover:!text-blue-600 text-sm leading-5 transition ease-in-out duration-150"
              onClick={() => {
                plausibleEvent("Phase1/CTA - Choose Meeting Point");
                history.push("/phase1");
              }}>
              Réaliser mes démarches pour partir
            </button>
          </div>
          <img src={require("../../assets/homePhase2Mobile.png")} />
        </div>
      </div>
    </>
  );
}
