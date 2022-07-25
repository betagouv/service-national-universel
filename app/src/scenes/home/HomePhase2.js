import React from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import plausibleEvent from "../../services/plausible";

export default function HomePhase2() {
  const young = useSelector((state) => state.Auth.young);
  const history = useHistory();
  return (
    <>
      {/* DESKTOP */}
      <div className="hidden lg:flex">
        <div className="my-12 mx-10 w-full">
          <div className="flex justify-between rounded-lg bg-white ">
            <div className="w-1/2 pl-10 py-12">
              <div className="text-[48px] font-medium leading-tight tracking-tight text-gray-800">
                <strong>{young.firstName},</strong>
                <br />
                prête pour la phase 2 ?
              </div>
              <div className="text-base left-7 text-gray-800 mt-5">
                Mettez votre énergie au service d’une société plus solidaire et découvrez <strong>votre talent pour l’engagement</strong> en réalisant une mission d’intérêt général
                !
              </div>
              <button
                className="rounded-[10px] border-[1px] py-2.5 px-3  bg-blue-600 hover:bg-white border-blue-600 mt-5 text-white hover:!text-blue-600 text-sm leading-5 font-medium transition ease-in-out duration-150"
                onClick={() => {
                  plausibleEvent("Phase 2/CTA - Realiser ma mission");
                  history.push("/phase2");
                }}>
                Réaliser ma mission d’intérêt général
              </button>
              <button
                className="rounded-[10px] border-[1px] py-2.5 px-3  hover:!bg-blue-600 bg-white border-blue-600 mt-3 hover:!text-white text-blue-600 text-sm leading-5 font-medium transition ease-in-out duration-150"
                onClick={() => history.push("/phase1")}>
                Réaliser ma mission d’intérêt général
              </button>
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
              <strong>{young.firstName},</strong>
              <br />
              prête pour la phase 2 ?
            </div>
            <div className="text-sm left-7 text-gray-800 mt-5">
              Mettez votre énergie au service d’une société plus solidaire et découvrez <strong>votre talent pour l’engagement</strong> en réalisant une mission d’intérêt général !
            </div>
            <button
              className="w-full rounded-[10px] border-[1px] py-2.5 px-3  bg-blue-600 hover:bg-white border-blue-600 mt-5 text-white hover:!text-blue-600 text-sm leading-5 font-medium transition ease-in-out duration-150"
              onClick={() => {
                plausibleEvent("Phase 2/CTA - Realiser ma mission");
                history.push("/phase2");
              }}>
              Réaliser ma mission d’intérêt général
            </button>
            <button
              className="w-full rounded-[10px] border-[1px] py-2.5 px-3  hover:!bg-blue-600 bg-white border-blue-600 mt-3 hover:!text-white text-blue-600 text-sm leading-5 font-medium transition ease-in-out duration-150"
              onClick={() => history.push("/phase1")}>
              Réaliser ma mission d’intérêt général
            </button>
          </div>
          <img src={require("../../assets/homePhase2Mobile.png")} />
        </div>
      </div>
    </>
  );
}
