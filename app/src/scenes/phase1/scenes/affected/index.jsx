import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { transportDatesToString, youngCanChangeSession } from "snu-lib";
import { getCohort } from "../../../../utils/cohorts";
import { isStepMedicalFieldDone } from "./utils/steps.utils";
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
import { getDepartureDate, getReturnDate } from "snu-lib/transport-info";
import BannerTermJuly from "../../components/BannerTermJuly";

export default function Affected() {
  const young = useSelector((state) => state.Auth.young);
  const [center, setCenter] = useState();
  const [meetingPoint, setMeetingPoint] = useState();
  const [session, setSession] = useState();
  const [showInfoMessage, setShowInfoMessage] = useState(false);
  const [loading, setLoading] = useState(true);

  const cohort = getCohort(young.cohort);
  const departureDate = getDepartureDate(young, session, cohort, meetingPoint);
  const returnDate = getReturnDate(young, session, cohort, meetingPoint);
  const allowedGrades = ["TermGT", "TermPro"];

  if (isStepMedicalFieldDone(young)) {
    window.scrollTo(0, 0);
  }

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
        toastr.error("Oups, une erreur est survenue lors de la récupération des informations de votre séjour de cohésion.");
      } finally {
        setLoading(false);
      }
    })();
  }, [young]);

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
    <div className="md:m-8">
      <div className="relative mb-4 flex max-w-[80rem] flex-col justify-between overflow-hidden bg-gray-50 py-8 md:mx-auto md:rounded-xl md:bg-white md:shadow-nina">
        {showInfoMessage && (
          <AlertBoxInformation
            title="Information"
            message="Suite au séjour de cohésion, les espaces volontaires vont s'actualiser dans les prochaines semaines, les attestations seront disponibles directement en ligne."
            onClose={() => setShowInfoMessage(false)}
          />
        )}

        <header className="items-between order-1 flex flex-col px-4 py-4 md:!px-8 lg:flex-row lg:justify-between lg:!px-16">
          <div>
            <h1 className="text-2xl leading-[2.5rem] md:text-5xl md:leading-[3.5rem]">
              Mon séjour de cohésion
              <br />
              <strong>{transportDatesToString(departureDate, returnDate)}</strong>
            </h1>
            {youngCanChangeSession(young) ? <ChangeStayLink className="my-4 md:my-8" /> : null}
            {allowedGrades.includes(young.grade) && (
              <BannerTermJuly responsive={"flex items-start justify-center mb-2 border-[1px] border-gray-200 rounded-lg shadow-sm p-4 lg:hidden"} />
            )}
          </div>

          <CenterInfo center={center} />
        </header>
        {allowedGrades.includes(young.grade) && (
          <BannerTermJuly responsive="hidden lg:flex order-2 items-center justify-center mb-4 border-[1px] border-gray-200 shadow-sm rounded-lg mx-10" />
        )}
        {isStepMedicalFieldDone(young) && (
          <div className="order-3 flex flex-none flex-col gap-4 md:flex-row">
            <TravelInfo location={young?.meetingPointId ? meetingPoint : center} departureDate={departureDate} returnDate={returnDate} />
            <TodoBackpack lunchBreak={meetingPoint?.bus?.lunchBreak} />
          </div>
        )}

        <StepsAffected center={center} session={session} meetingPoint={meetingPoint} departureDate={departureDate} returnDate={returnDate} />
        <FaqAffected className={`${isStepMedicalFieldDone(young) ? "order-3" : "order-4"}`} />
      </div>

      <div className="flex justify-end py-4 pr-8">
        <JDMA id="3504" />
      </div>
    </div>
  );
}
