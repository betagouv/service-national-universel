import Img3 from "../../assets/homePhase2Desktop.png";
import Img2 from "../../assets/homePhase2Mobile.png";
import React from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

import plausibleEvent from "../../services/plausible";
import { isCle } from "snu-lib";

export default function Affected() {
  const young = useSelector((state) => state.Auth.young);
  const history = useHistory();

  return (
    <>
      {/* DESKTOP */}
      <div className="hidden lg:flex">
        <div className="my-12 mx-10 w-full">
          <div className="flex items-center justify-between rounded-lg bg-white ">
            <div className="w-1/2 py-6 pl-10 pt-6">
              <div className="text-[48px] font-medium leading-tight tracking-tight text-gray-800">
                <strong>{young.firstName},</strong> bienvenue sur votre compte {isCle(young) ? "élève" : "volontaire"}.
              </div>
              <div className="left-7 mt-3 font-bold text-[#242526]">Bonne nouvelle, vous avez été affecté à un lieu pour votre séjour de cohésion&nbsp;!</div>
              <div className="flex w-fit flex-col items-stretch">
                <button
                  className="mt-5 rounded-[10px] border-[1px] border-blue-600  bg-blue-600 py-2.5 px-3 text-sm font-medium leading-5 text-white transition duration-150 ease-in-out hover:bg-white hover:!text-blue-600"
                  onClick={() => {
                    plausibleEvent("Phase1/CTA - Choose Meeting Point");
                    history.push("/phase1");
                  }}>
                  Réaliser mes démarches pour partir
                </button>
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
              <strong>{young.firstName},</strong> bienvenue sur votre compte volontaire.
            </div>
            <div className="left-7 mt-3 font-bold text-[#242526]">Bonne nouvelle vous avez été affecté à un lieu pour votre séjour de cohésion !</div>
            <button
              className="mt-3 w-full rounded-[10px] border-[1px] border-blue-600  bg-blue-600 py-2.5 px-3 text-sm leading-5 text-white transition duration-150 ease-in-out hover:bg-white hover:!text-blue-600"
              onClick={() => {
                plausibleEvent("Phase1/CTA - Choose Meeting Point");
                history.push("/phase1");
              }}>
              Réaliser mes démarches pour partir
            </button>
          </div>
          <img src={Img2} />
        </div>
      </div>
    </>
  );
}
