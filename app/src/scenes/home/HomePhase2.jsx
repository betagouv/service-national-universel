import Img3 from "../../assets/homePhase2Desktop.png";
import Img2 from "../../assets/homePhase2Mobile.png";
import React from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import plausibleEvent from "../../services/plausible";

// RESPONSIVE !
export default function HomePhase2() {
  const young = useSelector((state) => state.Auth.young);
  const history = useHistory();
  return (
    <>
      {/* DESKTOP */}
      <div className="hidden lg:flex">
        <div className="my-12 mx-10 w-full">
          <div className="flex items-center justify-between rounded-lg bg-white ">
            <div className="w-1/2 py-12 pl-10">
              <div className="text-[48px] font-medium leading-tight tracking-tight text-gray-800">
                <strong>{young.firstName},</strong>
                <br />
                {young.gender === "female" ? "prête " : "prêt "}
                pour la phase engagement?
              </div>
              <div className="left-7 mt-5 text-base text-gray-800">
                Mettez votre énergie au service d&apos;une société plus solidaire et découvrez votre talent pour l&apos;engagement en réalisant une mission d&apos;intérêt général
                ou en rejoignant un programme d’engagement.
              </div>
              <div className="flex w-fit flex-col items-stretch">
                <button
                  className="mt-5 rounded-[10px] border-[1px] border-blue-600  bg-blue-600 py-2.5 px-3 text-sm font-medium leading-5 text-white transition duration-150 ease-in-out hover:bg-white hover:!text-blue-600"
                  onClick={() => {
                    plausibleEvent("Phase 2/CTA - Realiser ma mission");
                    history.push("/phase2");
                  }}>
                  Je m&apos;engage
                </button>
                <button
                  className="mt-3 rounded-[10px] border-[1px] border-blue-600  bg-white py-2.5 px-3 text-sm font-medium leading-5 text-blue-600 transition duration-150 ease-in-out hover:!bg-blue-600 hover:!text-white"
                  onClick={() => history.push("/phase1")}>
                  Voir les détails de ma phase 1
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
              <strong>{young.firstName},</strong>
              <br />
              {young.gender === "female" ? "prête " : "prêt "}
              pour la phase engagement?
            </div>
            <div className="left-7 mt-5 text-sm text-gray-800">
              Mettez votre énergie au service d&apos;une société plus solidaire et découvrez votre talent pour l&apos;engagement en réalisant une mission d&apos;intérêt général ou
              en rejoignant un programme d’engagement.
            </div>
            <button
              className="mt-5 w-full rounded-[10px] border-[1px] border-blue-600  bg-blue-600 py-2.5 px-3 text-sm font-medium leading-5 text-white transition duration-150 ease-in-out hover:bg-white hover:!text-blue-600"
              onClick={() => {
                plausibleEvent("Phase 2/CTA - Realiser ma mission");
                history.push("/phase2");
              }}>
              Je m&apos;engage
            </button>
            <button
              className="mt-3 w-full rounded-[10px] border-[1px] border-blue-600  bg-white py-2.5 px-3 text-sm font-medium leading-5 text-blue-600 transition duration-150 ease-in-out hover:!bg-blue-600 hover:!text-white"
              onClick={() => history.push("/phase1")}>
              Voir les détails de ma phase 1
            </button>
          </div>
          <img src={Img2} />
        </div>
      </div>
    </>
  );
}
