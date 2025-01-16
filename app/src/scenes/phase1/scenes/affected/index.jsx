import React, { useState } from "react";
import { youngCanChangeSession, getCohortPeriod } from "snu-lib";
import useCohort from "@/services/useCohort";
import useAffectationData from "./utils/useAffectationData";
import { AlertBoxInformation } from "../../../../components/Content";
import ChangeStayLink from "../../components/ChangeStayLink";
import CenterInfo from "./components/CenterInfo";
import FaqAffected from "./components/FaqAffected";
import JDMA from "../../../../components/JDMA";
import Loader from "../../../../components/Loader";
import Problem from "./components/Problem";
import StepsAffected from "./components/StepsAffected";
import TravelInfo from "./components/TravelInfo";
import TodoBackpack from "./components/TodoBackpack";
import { areAllStepsDone } from "./utils/steps.utils";
import useAuth from "@/services/useAuth";
import HomeContainer from "@/components/layout/HomeContainer";
import HomeHeader from "@/components/layout/HomeHeader";
import hero from "../../../../assets/hero/home.png";

export default function Affected() {
  const { young, isCLE } = useAuth();
  const { center, meetingPoint, departureDate, returnDate, isPending: loading } = useAffectationData();
  const [showInfoMessage, setShowInfoMessage] = useState(false);

  const { cohort } = useCohort();
  const title = `Mon séjour de cohésion ${getCohortPeriod(cohort)}`;

  if (areAllStepsDone(young)) {
    window.scrollTo(0, 0);
  }

  if (loading) {
    return (
      <div className="my-12 mx-10 w-full">
        <Loader />
      </div>
    );
  }

  if (!center && !meetingPoint) {
    return <Problem cohort={young.cohort} />;
  }

  return (
    <HomeContainer>
      <HomeHeader title={title} img={hero}>
        {youngCanChangeSession(young) ? <ChangeStayLink className="my-4 md:my-8" /> : null}

        <CenterInfo center={center} />

        {showInfoMessage && (
          <AlertBoxInformation
            title="Information"
            message="Suite au séjour de cohésion, les espaces volontaires vont s'actualiser dans les prochaines semaines, les attestations seront disponibles directement en ligne."
            onClose={() => setShowInfoMessage(false)}
          />
        )}
      </HomeHeader>

      {areAllStepsDone(young) && (
        <div className="mt-4 gap-6 grid grid-cols-1 md:grid-cols-3">
          <div>
            <TravelInfo location={young?.meetingPointId ? meetingPoint : center} departureDate={departureDate} returnDate={returnDate} />
          </div>
          <div className="col-span-2">
            <TodoBackpack />
          </div>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-12">
        <StepsAffected />

        <div className={areAllStepsDone ? "-order-1" : ""}>{!isCLE && <FaqAffected />}</div>

        <div className="flex justify-end py-4 pr-8">
          <JDMA id="3504" />
        </div>
      </div>
    </HomeContainer>
  );
}
