import { React, useEffect, useState } from "react";
import { Redirect } from "react-router-dom";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { YOUNG_STATUS, YOUNG_STATUS_PHASE1, YOUNG_STATUS_PHASE2, getCohortNames, hasAccessToReinscription } from "../../utils";
import { cohortAssignmentAnnouncementsIsOpenForYoung, getCohort } from "../../utils/cohorts";
import Affected from "./Affected";
import FutureCohort from "./FutureCohort";
import InscriptionClosedCLE from "./InscriptionClosedCLE";
import HomePhase2 from "./HomePhase2";
import Phase1NotDone from "./Phase1NotDone";
import WaitingReinscription from "./WaitingReinscription";
import Default from "./default";
import RefusedV2 from "./refusedV2";
import ValidatedV2 from "./validatedV2";
import WaitingCorrectionV2 from "./waitingCorrectionV2";
import WaitingValidation from "./waitingValidation";
import WaitingList from "./waitingList";
import Withdrawn from "./withdrawn";
import DelaiDepasse from "./DelaiDepasse";
import useAuth from "@/services/useAuth";
import AvenirCohort from "./AvenirCohort";
import { isCohortTooOld } from "snu-lib";
import { capture } from "@/sentry";
import { toastr } from "react-redux-toastr";
import API from "@/services/api";
import Loader from "@/components/Loader";

export default function Home() {
  useDocumentTitle("Accueil");
  const { young, isCLE } = useAuth();
  const cohort = getCohort(young.cohort);

  const [reinscriptionOpen, setReinscriptionOpen] = useState(false);
  const [reinscriptionOpenLoading, setReinscriptionOpenLoading] = useState(true);

  // A combiner dans un service useReinscription
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
    // SI JEUNE EXCLU, RETURN ECRAN EXCLUSION.
    // SI JEUNE REFUSÉ: <RefusedV2>
    // fonction hasAccessToPhase2 => RETURN HomePhase2

    // Mon inscription est complete => YOUNG_STATUS.VALIDATED || YOUNG_STATUS.WAITING_LIST
    // <WaitingList>
    // <WaitingAffectation>
    // <Affected>

    // Mon inscription est en cours
    //   <WaitingValidation>
    //   <WaitingCorrection>

    // Je peux me réinscrire
    //    <WaitingReinscription>

    // Je ne peux pas m'inscrire sur l'année en cours:
    //   <Withdrawn />
    //   <AvenirCohort /> MERGE AVEC =>  <FutureCohort />

    // Mon séjour est en cours

    const hasWithdrawn = [YOUNG_STATUS.WITHDRAWN, YOUNG_STATUS.ABANDONED].includes(young.status);

    if (young.status === YOUNG_STATUS.REFUSED) return <RefusedV2 />;

    if ([YOUNG_STATUS.VALIDATED].includes(young.status) && young.statusPhase1 === YOUNG_STATUS_PHASE1.NOT_DONE) {
      return <Phase1NotDone />;
    }

    if (hasAccessToReinscription(young)) {
      if (!reinscriptionOpen) {
        if (hasWithdrawn) {
          return <Withdrawn />;
        }
        if (young.cohort === "à venir" && [YOUNG_STATUS.WAITING_LIST, YOUNG_STATUS.VALIDATED].includes(young.status)) {
          return <AvenirCohort />;
        }
        if (young.cohort === "à venir" && [YOUNG_STATUS.WAITING_VALIDATION, YOUNG_STATUS.WAITING_CORRECTION].includes(young.status)) {
          return <FutureCohort />;
        }
      }
      return <WaitingReinscription reinscriptionOpen={reinscriptionOpen} />;
    }

    if (hasWithdrawn) {
      return <Withdrawn />;
    }

    // A DEPLACER DANS HomePhase2
    const hasCompletedPhase2 = [YOUNG_STATUS_PHASE2.DONE, YOUNG_STATUS_PHASE2.EXEMPTED].includes(young.statusPhase2);
    const hasMission = young.phase2ApplicationStatus.some((status) => ["VALIDATED", "IN_PROGRESS"].includes(status));

    // A DEPLACER DANS HomePhase2
    if (isCohortTooOld(young) && !hasCompletedPhase2 && !hasMission) {
      return <DelaiDepasse />;
    }

    // DOUBLON AVEC ValidatedV2 => Dégager un des deux.
    if (young.status === YOUNG_STATUS.WAITING_LIST) return <WaitingList />;

    if (
      young.status === YOUNG_STATUS.VALIDATED &&
      [YOUNG_STATUS_PHASE1.DONE, YOUNG_STATUS_PHASE1.EXEMPTED].includes(young.statusPhase1) &&
      [YOUNG_STATUS_PHASE2.IN_PROGRESS, YOUNG_STATUS_PHASE2.WAITING_REALISATION].includes(young.statusPhase2)
    ) {
      return <HomePhase2 />;
    }

    // Si le jeune est dans une cohorte de cette année.
    if (getCohortNames(true, false, false).includes(young.cohort) && ![YOUNG_STATUS_PHASE1.DONE, YOUNG_STATUS_PHASE1.EXEMPTED].includes(young.statusPhase1)) {
      // they are in the new cohort, we display the inscription step
      const isCohortInstructionOpen = new Date() < new Date(cohort.instructionEndDate);
      if (isCLE && [YOUNG_STATUS.WAITING_VALIDATION, YOUNG_STATUS.WAITING_CORRECTION].includes(young.status) && !isCohortInstructionOpen) {
        return <InscriptionClosedCLE />;
      }
      if (young.status === YOUNG_STATUS.WAITING_VALIDATION) return <WaitingValidation />;
      if (young.status === YOUNG_STATUS.WAITING_CORRECTION) return <WaitingCorrectionV2 />;
      if (young.status === YOUNG_STATUS.VALIDATED) {
        if (young.statusPhase1 === YOUNG_STATUS_PHASE1.AFFECTED && cohortAssignmentAnnouncementsIsOpenForYoung(young.cohort)) {
          return <Affected />;
        } else {
          // A RENOMMER => WaitingAffectation
          return <ValidatedV2 />;
        }
      }
    }

    return <Default />;
  };

  return renderStep();
}
