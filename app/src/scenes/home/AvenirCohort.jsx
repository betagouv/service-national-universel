import Img3 from "../../assets/homePhase2Mobile.png";
import Img2 from "../../assets/homePhase2Desktop.png";
import React from "react";
import { useSelector } from "react-redux";
import { YOUNG_STATUS } from "snu-lib";
import Clock from "../../assets/icons/Clock";

export default function FutureCohort() {
  const young = useSelector((state) => state.Auth.young) || {};
  const title = "Bonjour ";
  return (
    <main className="bg-white md:rounded-xl shadow-sm md:m-8 flex flex-col md:flex-row max-w-7xl pb-20 md:pb-0">
      <img className="block md:hidden" src={Img3} />
      <div className="px-[1rem] md:p-[4rem]">
        <h1 className="text-3xl md:text-5xl md:mb-16 max-w-lg">
          {title}
          {young.firstName} {young.lastName},
        </h1>
        <hr className="my-4" />
        <div className="flex gap-6">
          <div className="flex-1">
            <Clock />
          </div>
          <p className="text-gray-500 text-sm">
            Votre inscription a été reportée sur<strong> un prochain séjour </strong> dont les dates vous seront communiquées ultérieurement.
          </p>
        </div>
        <hr className="my-4" />
      </div>
      <img className="flex-1 hidden xl:block" src={Img2} />
    </main>
  );
}
