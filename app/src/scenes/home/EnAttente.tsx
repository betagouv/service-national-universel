import React from "react";
import { YOUNG_STATUS } from "../../utils";
import { getCohort } from "@/utils/cohorts";
import useAuth from "@/services/useAuth";
import HomeContainer from "@/components/layout/HomeContainer";
import HomeHeader from "@/components/layout/HomeHeader";
import hero from "../../assets/hero/home.png";
import JDMA from "@/components/JDMA";
import CorrectionRequests from "./components/CorrectionRequests";
import StatusNotice from "./components/StatusNotice";
import SejourNotice from "./components/SejourNotice";

export default function EnAttente() {
  const { young, isCLE } = useAuth();
  const title = `${young.firstName}, bienvenue sur votre compte ${isCLE ? "élève" : "volontaire"}`;
  const cohort = getCohort(young.cohort);

  return (
    <HomeContainer>
      <HomeHeader title={title} img={hero}>
        <div className="grid grid-cols-1 gap-8">
          <SejourNotice cohort={cohort} />
          <StatusNotice status={young.status} />
        </div>
      </HomeHeader>

      {young.status === YOUNG_STATUS.WAITING_CORRECTION && <CorrectionRequests />}

      <div className="mt-12 flex justify-end">
        <JDMA id={3154} />
      </div>
    </HomeContainer>
  );
}
