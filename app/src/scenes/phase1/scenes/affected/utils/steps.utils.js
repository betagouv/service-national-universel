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
