import Img3 from "../../assets/homePhase2Desktop.png";
import Img2 from "../../assets/homePhase2Mobile.png";
import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import Clock from "../../assets/icons/Clock";
import { translate, getCohortPeriod } from "snu-lib";
import JDMA from "../../components/JDMA";
import plausibleEvent from "../../services/plausible";

export default function WaitingList() {
  const young = useSelector((state) => state.Auth.young);

  function handleClick() {
    plausibleEvent("Compte/CTA - Je donne mon avis", { statut: translate(young.status) });
  }

  return (
    <main className="max-w-7xl pb-20 md:pb-0 md:m-8 2xl:mx-auto">
      <div className="bg-white md:rounded-xl shadow-sm flex flex-col md:flex-row">
        <img className="block md:hidden" src={Img2} />

        <div className="px-[1rem] pb-[3rem] md:p-[3rem]">
          <h1 className="text-3xl md:text-[44px] font-medium tracking-tight !leading-snug text-gray-800 md:mb-10 max-w-xl">
            <strong>{young.firstName}</strong>, bienvenue sur votre compte volontaire.
          </h1>

          <div className="text-xl font-bold text-gray-800 mt-8">
            Vous êtes inscrit{young?.gender === "female" && "e"} sur liste complémentaire pour le séjour {getCohortPeriod(young.cohortData)}.
          </div>

          <hr className="text-gray-200 my-4" />

          <div className="flex gap-5">
            <Clock className="text-gray-600 flex-1 rounded-full bg-gray-100 p-2" />
            <div className="flex-1 text-sm leading-5 text-gray-500 space-y-6">
              Votre inscription au SNU est bien validée. Nous vous recontacterons dès qu’une place se libère dans les prochains jours
            </div>
          </div>

          <hr className="text-gray-200 my-4" />

          <Link to="/changer-de-sejour" className="whitespace-nowrap pb-4 text-sm text-blue-600 hover:underline hover:underline-offset-2">
            Changer de séjour &gt;
          </Link>
        </div>

        <img className="flex-1 hidden xl:block" src={Img3} />
      </div>

      <div className="flex justify-end m-8">
        <JDMA id="3154" onClick={handleClick} />
      </div>
    </main>
  );
}
