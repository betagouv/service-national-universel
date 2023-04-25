import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { translate, translateCohort, youngCanChangeSession } from "snu-lib";
import { getCohortDetail } from "../../../../utils/cohorts.js";
import { isStepMedicalFieldDone } from "./utils/steps.utils.js";
import api from "../../../../services/api";

import { AlertBoxInformation } from "../../../../components/Content";
import ChangeStayLink from "../../components/ChangeStayLink.js";
import CenterInfo from "./components/CenterInfo";
import FaqAffected from "./components/FaqAffected.js";
import JDMA from "../../../../components/JDMA.js";
import Loader from "../../../../components/Loader";
import Problem from "./components/Problem";
import StepsAffected from "./components/StepsAffected";
import TravelInfo from "./components/TravelInfo.js";
import TodoBackpack from "./components/TodoBackpack";

export default function Affected() {
  const young = useSelector((state) => state.Auth.young);
  const [center, setCenter] = useState();
  const [meetingPoint, setMeetingPoint] = useState();
  const [showInfoMessage, setShowInfoMessage] = useState(false);
  const [loading, setLoading] = useState(true);
  const cohortDetails = getCohortDetail(young.cohort);

  if (isStepMedicalFieldDone(young)) {
    window.scrollTo(0, 0);
  }

  const getMeetingPoint = async () => {
    const { data, ok } = await api.get(`/young/${young._id}/point-de-rassemblement?withbus=true`);
    if (!ok) setMeetingPoint(null);
    setMeetingPoint(data);
  };

  useEffect(() => {
    if (!young.sessionPhase1Id) return;
    (async () => {
      setLoading(true);
      const { data, code, ok } = await api.get(`/session-phase1/${young.sessionPhase1Id}/cohesion-center`);
      if (!ok) return toastr.error("error", translate(code));
      setCenter(data);
      getMeetingPoint();
      setLoading(false);
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
            <h1 className="text-2xl md:space-y-4 md:text-5xl">
              Mon séjour de cohésion
              <br />
              <strong className="flex items-center">{translateCohort(young.cohort)}</strong>
            </h1>
            {youngCanChangeSession(young) ? <ChangeStayLink className="my-4 md:my-8" /> : null}
          </div>

          <CenterInfo center={center} />
        </header>

        {isStepMedicalFieldDone(young) && (
          <div className="order-2 flex flex-none flex-col gap-4 md:flex-row">
            <TravelInfo location={young?.meetingPointId ? meetingPoint : center} cohortDetails={cohortDetails} />
            <TodoBackpack lunchBreak={meetingPoint?.bus?.lunchBreak} />
          </div>
        )}

        <StepsAffected center={center} />
        <FaqAffected className={`${isStepMedicalFieldDone(young) ? "order-3" : "order-4"}`} />
      </div>

      <JDMA id="3504" />
    </div>
  );
}
