import useAuth from "@/services/useAuth";
import useCohort from "@/services/useCohort";
import { getMeetingPointChoiceLimitDateForCohort } from "@/utils/cohorts";
import dayjs from "dayjs";
import { CohortType, YoungType } from "snu-lib";

export const ALONE_ARRIVAL_HOUR = "16h";
export const ALONE_DEPARTURE_HOUR = "11h";

export const pdrChoiceLimitDate = (cohort: CohortType): Date | string => {
  const date = getMeetingPointChoiceLimitDateForCohort(cohort);
  return date ? dayjs(date).locale("fr").format("D MMMM YYYY") : "?";
};

export const pdrChoiceExpired = (cohort: CohortType): boolean => {
  const date = getMeetingPointChoiceLimitDateForCohort(cohort);
  return date ? dayjs.utc().isAfter(dayjs(date)) : false;
};

export const hasPDR = (young: YoungType): boolean => !!young?.meetingPointId || young?.deplacementPhase1Autonomous === "true" || young?.transportInfoGivenByLocal === "true";

export const STEPS = {
  PDR: "PDR",
  AGREEMENT: "AGREEMENT",
  CONVOCATION: "CONVOCATION",
  MEDICAL_FILE: "MEDICAL_FILE",
};

export function isStepDone(step: string, young: YoungType, cohort: CohortType): boolean {
  switch (step) {
    case STEPS.PDR:
      return hasPDR(young) || pdrChoiceExpired(cohort);
    case STEPS.AGREEMENT:
      return young?.youngPhase1Agreement === "true";
    case STEPS.CONVOCATION:
      return young?.convocationFileDownload === "true";
    case STEPS.MEDICAL_FILE:
      return young?.cohesionStayMedicalFileDownload === "true";
    default:
      return false;
  }
}

export const countOfStepsDone = (young: YoungType, cohort: CohortType): number => {
  return Object.values(STEPS).filter((step) => isStepDone(step, young, cohort)).length;
};

export const areAllStepsDone = (young: YoungType, cohort: CohortType): boolean => {
  return countOfStepsDone(young, cohort) === Object.values(STEPS).length;
};

export function useSteps() {
  const { young } = useAuth();
  const { cohort } = useCohort();
  return {
    isStepDone: (step: string) => isStepDone(step, young, cohort),
    countOfStepsDone: countOfStepsDone(young, cohort),
    areAllStepsDone: areAllStepsDone(young, cohort),
  };
}
