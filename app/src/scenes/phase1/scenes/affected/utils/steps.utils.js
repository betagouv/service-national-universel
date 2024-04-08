import { getMeetingPointChoiceLimitDateForCohort } from "@/utils/cohorts";
import dayjs from "dayjs";
import { YOUNG_SOURCE } from "snu-lib";

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

const hasPDR = (young) => !!young?.meetingPointId || young?.deplacementPhase1Autonomous === "true" || young?.transportInfoGivenByLocal === "true";

/**
 *
 * @param {*} young
 * @returns {{ steps: { id: string, isDone: boolean, parcours: string[], stepNumber: number, enabled: boolean }[], count: number, total: number, allDone: boolean }}
 */
export function getSteps(young) {
  const steps = [
    {
      id: "PDR",
      isDone: hasPDR(young) || pdrChoiceExpired(young.cohort),
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

  const filteredSteps = steps.filter((s) => s.parcours.includes(young.source));
  const stepsWithEnabled = filteredSteps.map((s, i) => {
    const enabled = i === 0 || filteredSteps[i - 1].isDone;
    return { ...s, enabled, stepNumber: i + 1 };
  });

  const total = filteredSteps.length;
  const count = stepsWithEnabled.filter((s) => s.isDone).length;
  const allDone = stepsWithEnabled.every((s) => s.isDone);

  return { steps: stepsWithEnabled, count, total, allDone };
}
