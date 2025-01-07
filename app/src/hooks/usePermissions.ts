import useAuth from "@/services/useAuth";
import { getCohort } from "@/utils/cohorts";
import { hasAccessToReinscription, YOUNG_SOURCE, YOUNG_STATUS } from "snu-lib";

export default function usePermissions() {
  const { young } = useAuth();
  const cohort = getCohort(young.cohort);

  return {
    hasAccessToAVenir: young.source === YOUNG_SOURCE.VOLONTAIRE && cohort.name !== "à venir",
    hasAccessToDesistement: young.status !== YOUNG_STATUS.WITHDRAWN && young.status !== YOUNG_STATUS.ABANDONED,
    hasAccessToNavigation: ![YOUNG_STATUS.IN_PROGRESS, YOUNG_STATUS.REINSCRIPTION].includes(young.status),
    hasAccessToReinscription: hasAccessToReinscription(young),
    canModifyInscription: new Date() < new Date(cohort.inscriptionModificationEndDate),
  };
}
