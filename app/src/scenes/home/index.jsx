import { React, useEffect, useState } from "react";
import { Redirect } from "react-router-dom";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { getCohortNames, hasAccessToReinscription } from "../../utils";
import { cohortAssignmentAnnouncementsIsOpenForYoung, getCohort } from "../../utils/cohorts";
import Affected from "./Affected";
import FutureCohort from "./FutureCohort";
import InscriptionClosedCLE from "./InscriptionClosedCLE";
import HomePhase2 from "./HomePhase2";
import Phase1NotDone from "./Phase1NotDone";
import WaitingReinscription from "./WaitingReinscription";
import Default from "./default";
import RefusedV2 from "./refusedV2";
import Validated from "./validated";
import WaitingCorrection from "./waitingCorrection";
import WaitingValidation from "./waitingValidation";
import WaitingList from "./waitingList";
import Withdrawn from "./withdrawn";
import Excluded from "./Excluded";
import DelaiDepasse from "./DelaiDepasse";
import useAuth from "@/services/useAuth";
import AvenirCohort from "./AvenirCohort";
import { YOUNG_STATUS, YOUNG_STATUS_PHASE1, YOUNG_STATUS_PHASE2, isCohortTooOld } from "snu-lib";
import { capture } from "@/sentry";
import { toastr } from "react-redux-toastr";
import API from "@/services/api";
import Loader from "@/components/Loader";
import { wasYoungExcluded, hasAccessToPhase2, hasCompletedPhase2 } from "../../utils";

export default function Home() {
  useDocumentTitle("Accueil");
  const { young, isCLE } = useAuth();
  const cohort = getCohort(young.cohort);

  const [reinscriptionOpen, setReinscriptionOpen] = useState(false);
  const [reinscriptionOpenLoading, setReinscriptionOpenLoading] = useState(true);

  const fetchReInscriptionOpen = async () => {
    try {
      const { ok, data, code } = await API.get(`/cohort-session/isReInscriptionOpen`);
      if (!ok) {
        capture(new Error(code));
        return toastr.error("Oups, une erreur est survenue", code);
      }
      setReinscriptionOpen(data);
      setReinscriptionOpenLoading(false);
    } catch (e) {
      setReinscriptionOpenLoading(false);
    }
  };

  useEffect(() => {
    fetchReInscriptionOpen();
  }, []);

  if (reinscriptionOpenLoading) return <Loader />;

  if (!young) return <Redirect to="/auth" />;

  const renderStep = () => {
    // Je ne peux plus participer au SNU :
    if (wasYoungExcluded(young)) return <Excluded />;
    if (young.status === YOUNG_STATUS.REFUSED) return <RefusedV2 />;

    // Je peux accéder à la Phase 2 si la cohorte n'est pas trop ancienne et que j'ai des missions:
    const hasMission = young.phase2ApplicationStatus.some((status) => ["VALIDATED", "IN_PROGRESS"].includes(status));
    if (hasAccessToPhase2(young)) {
      return <HomePhase2 />;
    } else if (isCohortTooOld(young) && !hasCompletedPhase2(young) && !hasMission) {
      return <DelaiDepasse />;
    }

    // Mon inscription est complète :
    if (getCohortNames(true, false, false).includes(young.cohort) && ![YOUNG_STATUS_PHASE1.DONE, YOUNG_STATUS_PHASE1.EXEMPTED].includes(young.statusPhase1)) {
      // they are in the new cohort, we display the inscription step
      const isCohortInstructionOpen = new Date() < new Date(cohort.instructionEndDate);
      if (isCLE && [YOUNG_STATUS.WAITING_VALIDATION, YOUNG_STATUS.WAITING_CORRECTION].includes(young.status) && !isCohortInstructionOpen) {
        return <InscriptionClosedCLE />;
      }
      if (young.status === YOUNG_STATUS.WAITING_VALIDATION) return <WaitingValidation />;
      if (young.status === YOUNG_STATUS.WAITING_CORRECTION) return <WaitingCorrection />;
      if (young.status === YOUNG_STATUS.VALIDATED) {
        if (young.statusPhase1 === YOUNG_STATUS_PHASE1.AFFECTED && cohortAssignmentAnnouncementsIsOpenForYoung(young.cohort)) {
          return <Affected />;
        } else {
          return <Validated />;
        }
      }
    }

    // Mon inscription est en cours :

    if (reinscriptionOpen && hasAccessToReinscription(young)) {
      return <WaitingReinscription reinscriptionOpen={reinscriptionOpen} />;
    }

    if ([YOUNG_STATUS.VALIDATED].includes(young.status) && young.statusPhase1 === YOUNG_STATUS_PHASE1.NOT_DONE) {
      return <Phase1NotDone />;
    }
    if (young.cohort === "à venir" && [YOUNG_STATUS.WAITING_LIST, YOUNG_STATUS.VALIDATED].includes(young.status)) {
      return <AvenirCohort />;
    }
    if (young.cohort === "à venir" && [YOUNG_STATUS.WAITING_VALIDATION, YOUNG_STATUS.WAITING_CORRECTION].includes(young.status)) {
      return <FutureCohort />;
    }

    const hasWithdrawn = [YOUNG_STATUS.WITHDRAWN, YOUNG_STATUS.ABANDONED].includes(young.status);
    if (hasWithdrawn) {
      return <Withdrawn />;
    }

    if (young.status === YOUNG_STATUS.WAITING_LIST) return <WaitingList />;

    return <Default />;
  };

  return renderStep();
}
