import React, { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import useAuth from "@/services/useAuth";
import { HiArrowLeft } from "react-icons/hi";
import { getCohortPeriod } from "snu-lib";
import { getCohort } from "@/utils/cohorts";
import { WITHRAWN_REASONS, YOUNG_STATUS_PHASE1 } from "snu-lib";
import ReasonMotifSection from "../components/ReasonMotifSection";
import CurrentSejourNotice from "../components/CurrentSejourNotice";

export default function PrevenirSejour() {
  const { young } = useAuth();
  const cohort = getCohort(young.cohort);
  const history = useHistory();
  const cohortPeriod = getCohortPeriod(cohort);
  const [withdrawnMessage, setWithdrawnMessage] = useState("");
  const [withdrawnReason, setWithdrawnReason] = useState("");
  const filteredWithdrawnReasons = WITHRAWN_REASONS.filter(
    (r) =>
      (!r.phase2Only || young.statusPhase1 === YOUNG_STATUS_PHASE1.DONE || young.statusPhase1 === YOUNG_STATUS_PHASE1.EXEMPTED) &&
      (!r.cohortOnly || r.cohortOnly.includes(young.cohort)),
  );

  return (
    <div className="flex flex-col justify-center items-center bg-white pb-12 px-4 md:px-[8rem]">
      <div className="w-full flex items-center justify-between py-4">
        <button onClick={() => history.push("/changer-de-sejour/no-date")} className="flex items-center gap-1 mr-2">
          <HiArrowLeft className="text-xl text-gray-500" />
        </button>
        <h1 className="text-2xl font-bold text-center">Etre alerté lors de l'ouverture des inscriptions sur les prochains séjours</h1>
        <div></div>
      </div>
      <CurrentSejourNotice />
      <hr />
      <p className="mt-4 mb-6 text-sm leading-5 text-[#6B7280] font-normal">Vous serez alerté(e) par e-mail lors de l'ouverture des futures inscriptions.</p>

      <ReasonMotifSection
        filteredWithdrawnReasons={filteredWithdrawnReasons}
        withdrawnReason={withdrawnReason}
        setWithdrawnReason={setWithdrawnReason}
        withdrawnMessage={withdrawnMessage}
        setWithdrawnMessage={setWithdrawnMessage}
      />
    </div>
  );
}
