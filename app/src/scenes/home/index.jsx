import { React, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Redirect } from "react-router-dom";

import Loader from "@/components/Loader";
import { capture } from "@/sentry";
import API from "@/services/api";
import { toastr } from "react-redux-toastr";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { YOUNG_STATUS, YOUNG_STATUS_PHASE1, YOUNG_STATUS_PHASE2, getCohortNames, hasAccessToReinscription } from "../../utils";
import { cohortAssignmentAnnouncementsIsOpenForYoung } from "../../utils/cohorts";
import Affected from "./Affected";
import FutureCohort from "./FutureCohort";
import HomePhase2 from "./HomePhase2";
import Phase1NotDone from "./Phase1NotDone";
import WaitingReinscription from "./WaitingReinscription";
import WaitingReinscriptionInscriptionClosed from "./WaitingReinscriptionOld";
import Default from "./default";
import RefusedV2 from "./refusedV2";
import ValidatedV2 from "./validatedV2";
import WaitingCorrectionV2 from "./waitingCorrectionV2";
import WaitingValidation from "./waitingValidation";
import WaitingList from "./waitingList";
import Withdrawn from "./withdrawn";

export default function Home() {
  useDocumentTitle("Accueil");
  const young = useSelector((state) => state.Auth.young);
  const [isReinscriptionOpen, setReinscriptionOpen] = useState(false);
  const [isReinscriptionOpenLoading, setReinscriptionOpenLoading] = useState(true);

  const fetchInscriptionOpen = async () => {
    try {
      const { ok, data, code } = await API.get(`/cohort-session/isInscriptionOpen?timeZoneOffset=${new Date().getTimezoneOffset()}`);
      if (!ok) {
        capture(code);
        return toastr.error("Oups, une erreur est survenue", code);
      }
      setReinscriptionOpen(data);
      setReinscriptionOpenLoading(false);
    } catch (e) {
      setReinscriptionOpenLoading(false);
    }
  };

  useEffect(() => {
    fetchInscriptionOpen();
  }, []);

  if (!young) return <Redirect to="/auth" />;

  const renderStep = () => {
    if (young.status === YOUNG_STATUS.REFUSED) return <RefusedV2 />;

    if (isReinscriptionOpen === false) {
      if (young.status === YOUNG_STATUS.ABANDONED) return <Withdrawn />;
      if (young.status === YOUNG_STATUS.WITHDRAWN) return <Withdrawn />;
      if (young.status === YOUNG_STATUS.WAITING_LIST) return <WaitingList />;
    }

    if (hasAccessToReinscription(young)) {
      if (isReinscriptionOpenLoading) return <Loader />;
      // @todo: WaitingReinscriptionInscriptionClosed should be deleted and WaitingReinscription updated to handle both cases
      if (young.status === YOUNG_STATUS.WITHDRAWN && ["DONE", "EXEMPTED"].includes(young.statusPhase1)) {
        return <Withdrawn />;
      }
      return isReinscriptionOpen ? <WaitingReinscription /> : <WaitingReinscriptionInscriptionClosed />;
    }
    if (
      young.status === YOUNG_STATUS.VALIDATED &&
      [YOUNG_STATUS_PHASE1.DONE, YOUNG_STATUS_PHASE1.EXEMPTED].includes(young.statusPhase1) &&
      [YOUNG_STATUS_PHASE2.IN_PROGRESS, YOUNG_STATUS_PHASE2.WAITING_REALISATION].includes(young.statusPhase2)
    ) {
      return <HomePhase2 />;
    }

    if ([YOUNG_STATUS.VALIDATED, YOUNG_STATUS.WITHDRAWN].includes(young.status) && young.statusPhase1 === YOUNG_STATUS_PHASE1.NOT_DONE) {
      return <Phase1NotDone />;
    }

    if (getCohortNames(true, false, false).includes(young.cohort)) {
      // they are in the new cohort, we display the inscription step
      if (young.status === YOUNG_STATUS.WAITING_CORRECTION) return <WaitingCorrectionV2 />;
      if (young.status === YOUNG_STATUS.WAITING_VALIDATION) return <WaitingValidation />;
      if (young.status === YOUNG_STATUS.VALIDATED) {
        if (young.statusPhase1 === YOUNG_STATUS_PHASE1.AFFECTED && cohortAssignmentAnnouncementsIsOpenForYoung(young.cohort)) {
          return <Affected />;
        } else {
          return <ValidatedV2 />;
        }
      }
    }

    if (young.cohort === "à venir" && [YOUNG_STATUS.WAITING_VALIDATION, YOUNG_STATUS.WAITING_CORRECTION].includes(young.status)) {
      return <FutureCohort />;
    }

    return <Default />;
  };

  return renderStep();
}
