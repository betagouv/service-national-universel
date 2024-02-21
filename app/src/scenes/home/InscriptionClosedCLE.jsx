import Img3 from "../../assets/homePhase2Mobile.png";
import Img2 from "../../assets/homePhase2Desktop.png";
import React from "react";
import { useSelector } from "react-redux";
import { YOUNG_STATUS } from "snu-lib";
import Clock from "../../assets/icons/Clock";

export default function InscriptionClosedCLE() {
  const young = useSelector((state) => state.Auth.young) || {};
  const title = young.status === YOUNG_STATUS.WAITING_VALIDATION ? "Votre inscription n'a pas été validée à temps." : "Votre inscription n'a pas été corrigée à temps.";
  return (
    <main className="bg-white md:rounded-xl shadow-sm md:m-8 flex flex-col md:flex-row max-w-7xl pb-20 md:pb-0">
      <img className="block md:hidden" src={Img3} />
      <div className="px-[1rem] md:p-[4rem]">
        <h1 className="text-3xl md:text-5xl md:mb-16 max-w-lg">{title}</h1>
        <hr className="my-4" />
        <div className="flex gap-6">
          <div className="flex-1">
            <Clock />
          </div>
          <p className="text-gray-500 text-sm">Les inscriptions dans le cadre des classes engagées ont été clôturées pour l'année scolaire 2023-2024.</p>
        </div>
        <hr className="my-4" />
      </div>
      <img className="flex-1 hidden xl:block" src={Img2} />
    </main>
  );
}
