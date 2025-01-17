import hero from "../../assets/hero/home.png";
import React from "react";
import useAuth from "@/services/useAuth";
import { YOUNG_STATUS } from "snu-lib";
import { HiOutlineClock } from "react-icons/hi";
import HomeContainer from "@/components/layout/HomeContainer";
import HomeHeader from "@/components/layout/HomeHeader";

export default function InscriptionClosedCLE() {
  const { young } = useAuth();
  const title = young.status === YOUNG_STATUS.WAITING_VALIDATION ? "Votre inscription n'a pas été validée à temps." : "Votre inscription n'a pas été corrigée à temps.";

  return (
    <HomeContainer>
      <HomeHeader title={title} img={hero}>
        <div className="flex gap-2 border-t border-b my-6 py-3 items-center">
          <div className="flex justify-center items-center bg-gray-100 rounded-full w-fit p-1.5">
            <HiOutlineClock className="text-lg align-text-top text-gray-500" />
          </div>
          <p className="text-gray-500 text-sm">Les inscriptions dans le cadre des classes engagées ont été clôturées.</p>
        </div>
      </HomeHeader>
    </HomeContainer>
  );
}
