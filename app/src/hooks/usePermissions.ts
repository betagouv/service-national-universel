import useAuth from "@/services/useAuth";
import { getCohort } from "@/utils/cohorts";
import { YOUNG_SOURCE, YOUNG_STATUS } from "snu-lib";

export default function usePermissions() {
  const { young } = useAuth();
  const cohort = getCohort(young.cohort);

  return {
    hasAccessToAVenir: young.source === YOUNG_SOURCE.VOLONTAIRE,
    hasAccessToDesistement: young.status !== YOUNG_STATUS.WITHDRAWN && young.status !== YOUNG_STATUS.ABANDONED,
    canModifyInscription: new Date() < new Date(cohort.inscriptionModificationEndDate),
  };
}
