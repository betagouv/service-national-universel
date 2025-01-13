import React, { useEffect, useState } from "react";
import { toastr } from "react-redux-toastr";
import { capture } from "@/sentry";
import { isCle, youngCanChangeSession, getDepartureDate, getReturnDate, getCohortPeriod } from "snu-lib";
import { getCohort } from "../../../../utils/cohorts";
import api from "../../../../services/api";
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
  const { young } = useAuth();
  const [center, setCenter] = useState();
  const [meetingPoint, setMeetingPoint] = useState();
  const [session, setSession] = useState();
  const [showInfoMessage, setShowInfoMessage] = useState(false);
  const [loading, setLoading] = useState(true);

  const cohort = getCohort(young.cohort);
  const departureDate = getDepartureDate(young, session, cohort, meetingPoint);
  const returnDate = getReturnDate(young, session, cohort, meetingPoint);
  const data = { center, meetingPoint, session, departureDate, returnDate };

  const title = `Mon séjour de cohésion ${getCohortPeriod(cohort)}`;

  useEffect(() => {
    if (!young.sessionPhase1Id) return;
    (async () => {
      try {
        const { data: center } = await api.get(`/session-phase1/${young.sessionPhase1Id}/cohesion-center`);
        const { data: meetingPoint } = await api.get(`/young/${young._id}/point-de-rassemblement?withbus=true`);
        const { data: session } = await api.get(`/young/${young._id}/session/`);
        setCenter(center);
        setMeetingPoint(meetingPoint);
        setSession(session);
      } catch (e) {
        capture(e);
        toastr.error("Oups, une erreur est survenue lors de la récupération des informations de votre séjour de cohésion.");
      } finally {
        setLoading(false);
      }
    })();
  }, [young]);

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
            <TodoBackpack lunchBreak={meetingPoint?.bus?.lunchBreak} data={data} />
          </div>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-12">
        <StepsAffected data={data} />

        <div className={areAllStepsDone ? "-order-1" : ""}>{!isCle(young) && <FaqAffected />}</div>

        <div className="flex justify-end py-4 pr-8">
          <JDMA id="3504" />
        </div>
      </div>
    </HomeContainer>
  );
}
