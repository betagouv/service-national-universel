import { getMeetingPointChoiceLimitDateForCohort } from "@/utils/cohorts";
import dayjs from "dayjs";

export const ALONE_ARRIVAL_HOUR = "16h";
export const ALONE_DEPARTURE_HOUR = "11h";

export const pdrChoiceLimitDate = (cohort) => {
  const date = getMeetingPointChoiceLimitDateForCohort(cohort);
  return date ? dayjs(date).locale("fr").format("D MMMM YYYY") : "?";
};

export const pdrChoiceExpired = (cohort) => {
  const date = getMeetingPointChoiceLimitDateForCohort(cohort);
  return date ? dayjs.utc().isAfter(dayjs(date)) : false;
};

export const hasPDR = (young) => !!young?.meetingPointId || young?.deplacementPhase1Autonomous === "true" || young?.transportInfoGivenByLocal === "true";

export const STEPS = {
  PDR: "PDR",
  AGREEMENT: "AGREEMENT",
  CONVOCATION: "CONVOCATION",
  MEDICAL_FILE: "MEDICAL_FILE",
};

export function isStepDone(step, young) {
  switch (step) {
    case STEPS.PDR:
      return hasPDR(young) || pdrChoiceExpired(young?.cohortData);
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

export const countOfStepsDone = (young) => {
  return Object.values(STEPS).filter((step) => isStepDone(step, young)).length;
};

export const areAllStepsDone = (young) => {
  return countOfStepsDone(young) === Object.values(STEPS).length;
};
