import Img3 from "../../assets/homePhase2Desktop.png";
import Img2 from "../../assets/homePhase2Mobile.png";
import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { getCohort } from "../../utils/cohorts";
import Clock from "../../assets/icons/Clock";
import WaitingListContent from "./components/WaitingListContent";
import { translate, getCohortPeriod } from "snu-lib";
import JDMA from "../../components/JDMA";
import { environment } from "../../config";
import plausibleEvent from "../../services/plausible";

export default function WaitingList() {
  const young = useSelector((state) => state.Auth.young);
  const cohort = getCohort(young.cohort);

  function handleClick() {
    if (environment === "production") {
      plausibleEvent("Compte/CTA - Je donne mon avis", { statut: translate(young.status) });
    }
  }

  return (
    <>
      {/* DESKTOP */}
      <div className="hidden lg:flex">
        <div className="m-8 w-full">
          <div className="flex items-center justify-between overflow-hidden rounded-xl bg-white shadow-sm max-w-7xl mx-auto">
            <div className="flex w-1/2 flex-col gap-8 py-6 pl-10 pr-3">
              <div className="text-[44px] font-medium leading-tight tracking-tight text-gray-800">
                <strong>{young.firstName},</strong> bienvenue sur votre compte volontaire.
              </div>
              <div className="mt-2 text-xl font-bold text-[#242526]">
                Vous êtes inscrit{young?.gender === "female" && "e"} sur liste complémentaire pour le séjour {getCohortPeriod(cohort || young.cohort)}.
              </div>

              <hr className="text-gray-200" />
              <div className="flex gap-5">
                <Clock className="text-gray-600 flex-1 rounded-full bg-gray-100 p-2" />
                <div className="flex-1 text-sm leading-5 text-gray-500 space-y-6">
                  <WaitingListContent showLinks={cohort?.uselessInformation?.showChangeCohortButtonOnHomeWaitingList} />
                </div>
              </div>
              <hr className="text-gray-200" />
              <Link to="/changer-de-sejour" className="whitespace-nowrap pb-4 text-sm text-blue-600 hover:underline hover:underline-offset-2">
                Changer de séjour &gt;
              </Link>
            </div>
            <img className="w-1/2 object-fill" src={Img3} />
          </div>

          <div className="flex justify-end py-4 pr-8">
            <JDMA id="3154" />
          </div>
        </div>
      </div>
      {/* MOBILE */}
      <div className="flex w-full flex-col lg:hidden">
        <div className="flex flex-col-reverse bg-white">
          <div className="flex flex-col gap-4 px-4 pb-8   ">
            <div className="text-3xl font-medium leading-tight tracking-tight text-gray-800">
              <strong>{young.firstName},</strong> bienvenue sur votre compte volontaire.
            </div>
            <div className="mt-3 text-lg font-bold text-[#242526]">
              Vous êtes inscrit{young?.gender === "female" && "e"} sur liste complémentaire pour le séjour {getCohortPeriod(cohort || young.cohort)}.
            </div>

            <hr className="mt-3 text-gray-200" />
            <div className="flex gap-2 my-2">
              <Clock className="text-gray-600 rounded-full bg-gray-100 p-2" />
              <div className="flex-1 text-sm leading-5 text-gray-500 space-y-4">
                <WaitingListContent showLinks={cohort?.uselessInformation?.showChangeCohortButtonOnHomeWaitingList} />
              </div>
            </div>
            <hr className="text-gray-200" />

            <div className="flex justify-end py-4 pr-8">
              <JDMA id="3154" onClick={handleClick} />
            </div>
          </div>
          <img className="object-contain" src={Img2} />
        </div>
      </div>
    </>
  );
}
