import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { isCle, transportDatesToString, youngCanChangeSession, getDepartureDate, getReturnDate, YOUNG_SOURCE } from "snu-lib";
import { getCohort } from "../../../../utils/cohorts";
import api from "../../../../services/api";
import { hasPDR, pdrChoiceExpired } from "./utils/steps.utils";

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
import { RiInformationFill } from "react-icons/ri";
import useAuth from "@/services/useAuth";
import WithdrawalModal from "@/scenes/account/components/WithdrawalModal";

export default function Affected() {
  const young = useSelector((state) => state.Auth.young);
  const { isCLE } = useAuth();
  const [center, setCenter] = useState();
  const [meetingPoint, setMeetingPoint] = useState();
  const [session, setSession] = useState();
  const [showInfoMessage, setShowInfoMessage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const cohort = getCohort(young.cohort);
  const departureDate = getDepartureDate(young, session, cohort, meetingPoint);
  const returnDate = getReturnDate(young, session, cohort, meetingPoint);

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

  const steps = [
    {
      id: "PDR",
      isDone: hasPDR(young) || pdrChoiceExpired(young?.cohort),
      parcours: [YOUNG_SOURCE.CLE, YOUNG_SOURCE.VOLONTAIRE],
    },
    {
      id: "AGREEMENT",
      isDone: young?.youngPhase1Agreement === "true",
      parcours: [YOUNG_SOURCE.VOLONTAIRE],
    },
    {
      id: "CONVOCATION",
      isDone: young?.convocationFileDownload === "true",
      parcours: [YOUNG_SOURCE.CLE, YOUNG_SOURCE.VOLONTAIRE],
    },
    {
      id: "MEDICAL_FILE",
      isDone: young?.cohesionStayMedicalFileDownload === "true",
      parcours: [YOUNG_SOURCE.CLE, YOUNG_SOURCE.VOLONTAIRE],
    },
  ];

  const filteredSteps = steps.filter((s) => s.parcours.includes(young?.source));

  const stepsWithEnabled = filteredSteps.map((s, i) => {
    const enabled = i === 0 || filteredSteps[i - 1].isDone;
    return { ...s, enabled, stepNumber: i + 1 };
  });

  const allDone = stepsWithEnabled.every((s) => s.isDone);

  if (allDone) {
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
    <div className="md:m-8">
      <div className="relative mb-4 flex max-w-[80rem] flex-col justify-between overflow-hidden bg-gray-50 py-8 md:mx-auto md:rounded-xl md:bg-white md:shadow-nina">
        {showInfoMessage && (
          <AlertBoxInformation
            title="Information"
            message="Suite au séjour de cohésion, les espaces volontaires vont s'actualiser dans les prochaines semaines, les attestations seront disponibles directement en ligne."
            onClose={() => setShowInfoMessage(false)}
          />
        )}
        <WithdrawalModal isOpen={isOpen} onCancel={() => setIsOpen(false)} young={young} />

        <header className="items-between order-1 flex flex-col px-4 py-4 md:!px-8 lg:flex-row lg:justify-between lg:!px-16">
          <div>
            <h1 className="text-2xl leading-[2.5rem] md:text-5xl md:leading-[3.5rem]">
              Mon séjour de cohésion
              <br />
              <strong>{transportDatesToString(departureDate, returnDate)}</strong>
            </h1>
            {youngCanChangeSession(young) ? <ChangeStayLink className="my-4 md:my-8" /> : null}
          </div>

          <CenterInfo center={center} />
        </header>

        {allDone && (
          <div className="order-3">
            <div className="flex-none gap-6 grid grid-cols-1 md:grid-cols-3">
              <div>
                <TravelInfo location={young?.meetingPointId ? meetingPoint : center} departureDate={departureDate} returnDate={returnDate} />
              </div>
              <div className="col-span-2">
                <TodoBackpack lunchBreak={meetingPoint?.bus?.lunchBreak} />
              </div>
            </div>

            {isCLE && (
              <div className="bg-blue-50 rounded-xl xl:flex text-center text-sm p-3 mt-4 gap-2 md:m-16">
                <div>
                  <RiInformationFill className="text-xl text-blue-400 inline-block mr-2 align-bottom" />
                  <span className="text-blue-800 font-semibold">Vous n’êtes plus disponible ?</span>
                </div>
                <button className="text-blue-600 underline underline-offset-2" onClick={() => setIsOpen(true)}>
                  Se désister du SNU.
                </button>
              </div>
            )}
          </div>
        )}

        <StepsAffected steps={stepsWithEnabled} center={center} session={session} meetingPoint={meetingPoint} departureDate={departureDate} returnDate={returnDate} />
        {!isCle(young) && <FaqAffected className={`${allDone ? "order-3" : "order-4"}`} />}
      </div>

      <div className="flex justify-end py-4 pr-8">
        <JDMA id="3504" />
      </div>
    </div>
  );
}
