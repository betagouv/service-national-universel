import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { translate, translateCohort, youngCanChangeSession } from "snu-lib";
import { getCohortDetail } from "../../../../utils/cohorts.js";
import api from "../../../../services/api";

import { AlertBoxInformation } from "../../../../components/Content";
import ChangeStayLink from "../../components/ChangeStayLink.js";
import FaqAffected from "./components/FaqAffected.js";
import Loader from "../../../../components/Loader";
import StepsAffected from "./components/StepsAffected";
import JDMA from "../../../../components/JDMA.js";
import { Problem } from "./components/Problem";
import { LieuAffectation } from "./components/LieuAffectation";
import { ResumeDuVoyage } from "./components/ResumeDuVoyage";
import { DansMonSac } from "./components/DansMonSac";
import { environment } from "../../../../config.js";

export default function Affected() {
  const young = useSelector((state) => state.Auth.young);
  const [center, setCenter] = useState();
  const [meetingPoint, setMeetingPoint] = useState();
  const [showInfoMessage, setShowInfoMessage] = useState(false);
  const [loading, setLoading] = useState(true);
  const cohortDetails = getCohortDetail(young.cohort);
  const nbvalid = getNbValid(young);
  const areStepsDone = nbvalid === 4;

  // Pour tester l'animation de scroll
  // const [areStepsDone, setAreStepsDone] = useState(false);

  if (areStepsDone) {
    window.scrollTo(0, 0);
  }

  function getNbValid(young) {
    if (young) {
      let nb = 0;
      if (young.meetingPointId || young.deplacementPhase1Autonomous === "true" || young.transportInfoGivenByLocal === "true") nb++;
      if (young.youngPhase1Agreement === "true") nb++;
      if (young.convocationFileDownload === "true") nb++;
      if (young.cohesionStayMedicalFileDownload === "true") nb++;
      return nb;
    }
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
    return <Problem young={young} />;
  }

  return (
    <div className="md:m-10">
      <div className="max-w-[80rem] rounded-xl shadow-nina md:mx-auto py-8 relative overflow-hidden flex flex-col justify-between bg-gray-50 md:bg-white mb-4">
        {showInfoMessage && (
          <AlertBoxInformation
            title="Information"
            message="Suite au séjour de cohésion, les espaces volontaires vont s'actualiser dans les prochaines semaines, les attestations seront disponibles directement en ligne."
            onClose={() => setShowInfoMessage(false)}
          />
        )}

        <header className="flex flex-col items-between px-4 md:!px-8 lg:!px-16 py-4 lg:justify-between lg:flex-row order-1">
          <div>
            <h1 className="text-2xl md:text-5xl md:space-y-4">
              Mon séjour de cohésion
              <br />
              <strong className="flex items-center">{translateCohort(young.cohort)}</strong>
            </h1>
            {youngCanChangeSession(young) ? <ChangeStayLink className="my-4 md:my-8" /> : null}
          </div>

          <LieuAffectation center={center} />
        </header>

        {environment !== "production" && (
          <div
            className={`md:border-t-[1px] flex flex-col md:flex-row flex-none gap-12 md:gap-32 pt-4 order-2 overflow-hidden transition-all ease-in-out duration-500
            ${areStepsDone ? "h-[700px] md:h-[350px]" : "h-0"}`}>
            <ResumeDuVoyage meetingPoint={meetingPoint} cohortDetails={cohortDetails} />
            <DansMonSac />
          </div>
        )}

        <StepsAffected young={young} center={center} nbvalid={nbvalid} />

        {/* Pour tester l'animation de scroll */}
        {/* <button onClick={() => setAreStepsDone(!areStepsDone)} className="order-5">
          {areStepsDone ? "Hide" : "Show"}
        </button> */}

        <FaqAffected className={`transition-all ${areStepsDone ? "order-3" : "order-4"}`} />
      </div>

      <JDMA id="3504" />
    </div>
  );
}
