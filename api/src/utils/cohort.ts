import { YOUNG_STATUS, getRegionForEligibility, regionsListDROMS, COHORT_TYPE, getDepartmentForEligibility, YoungType } from "snu-lib";
import { YoungModel, CohortModel, InscriptionGoalModel, CohortDocument } from "../models";

export type CohortDocumentWithPlaces = CohortDocument<{
  numberOfCandidates?: number;
  numberOfValidated?: number;
  goal?: number;
  goalReached?: boolean;
  isFull?: boolean;
  isEligible?: boolean;
}>;

type YoungInfo = Pick<YoungType, "_id" | "cohort" | "birthdateAt" | "grade" | "status" | "schooled" | "schoolRegion" | "region" | "department" | "schoolDepartment" | "zip"> & {
  isReInscription?: boolean;
};

// TODO: déplacer isReInscription dans un nouveau params plutot que dans le young
export async function getFilteredSessions(young: YoungInfo, timeZoneOffset?: string | number | null) {
  const cohorts = await CohortModel.find({});
  const region = getRegionForEligibility(young);
  const department = getDepartmentForEligibility(young);

  const currentCohortYear = young.cohort ? new Date(cohorts.find((c) => c.name === young.cohort)?.dateStart || "")?.getFullYear() : undefined;
  const sessions: CohortDocumentWithPlaces[] = cohorts.filter((session) => {
    // if the young has already a cohort, he can only apply for the cohorts of the same year
    console.log("currentCohortYear", young.cohort, currentCohortYear, session.dateStart.getFullYear());
    return (
      (!young.cohort || currentCohortYear === session.dateStart.getFullYear()) &&
      session.eligibility?.zones.includes(department) &&
      session.eligibility?.schoolLevels.includes(young.grade!) &&
      young.birthdateAt &&
      session.eligibility?.bornAfter <= young.birthdateAt &&
      // @ts-expect-error comparaison d'une Date avec un number...
      session.eligibility?.bornBefore.setTime(session.eligibility?.bornBefore.getTime() + 11 * 60 * 60 * 1000) >= young.birthdateAt &&
      (session.getIsInscriptionOpen(Number(timeZoneOffset)) ||
        (session.getIsReInscriptionOpen(Number(timeZoneOffset)) && young.isReInscription) ||
        (session.getIsInstructionOpen(Number(timeZoneOffset)) && ([YOUNG_STATUS.WAITING_CORRECTION, YOUNG_STATUS.WAITING_VALIDATION] as string[]).includes(young.status)))
    );
  });
  for (let session of sessions) {
    session.isEligible = true;
  }
  return getPlaces(sessions, region);
}

export async function getAllSessions(young: YoungInfo) {
  const cohorts = await CohortModel.find({});
  const region = getRegionForEligibility(young);
  const sessionsWithPlaces = await getPlaces(cohorts, region);
  const availableSessions = await getFilteredSessions(young);
  for (let session of sessionsWithPlaces) {
    session.isEligible = availableSessions.some((e) => e.name === session.name);
  }
  return sessionsWithPlaces;
}

export async function getFilteredSessionsForCLE() {
  const sessionsCLE = await CohortModel.find({ type: COHORT_TYPE.CLE });
  let now = Date.now();
  const sessions = sessionsCLE.filter(
    (session) =>
      !!session.inscriptionStartDate &&
      // @ts-expect-error comparaison d'une Date avec un number...
      session.inscriptionStartDate <= now &&
      // @ts-expect-error comparaison d'une Date avec un number...
      ((session.inscriptionEndDate && session.inscriptionEndDate > now) || (session.instructionEndDate && session.instructionEndDate > now)),
  );
  return sessions;
}

async function getPlaces(sessions: CohortDocumentWithPlaces[], region: string): Promise<CohortDocumentWithPlaces[]> {
  const cohorts = await CohortModel.find({});
  const sessionNames = sessions.map(({ name }) => name);
  const goals = await InscriptionGoalModel.aggregate([{ $match: { region, cohort: { $in: sessionNames } } }, { $group: { _id: "$cohort", total: { $sum: "$max" } } }]);
  const agg = await YoungModel.aggregate([
    {
      $match: {
        $or: [
          { schooled: "true", schoolRegion: region },
          { schooled: "false", region },
        ],
        cohort: { $in: sessionNames },
      },
    },
    {
      $group: {
        _id: "$cohort",
        candidates: { $sum: { $cond: [{ $in: ["$status", ["IN_PROGRESS", "WAITING_VALIDATION", "WAITING_CORRECTION", "WAITING_LIST", "REINSCRIPTION"]] }, 1, 0] } },
        validated: { $sum: { $cond: [{ $in: ["$status", ["VALIDATED"]] }, 1, 0] } },
      },
    },
  ]);

  const cohortIds = cohorts.map((s) => s._id.toString());
  const sessionObj = sessions.map((session) => {
    if (cohorts.map((e) => e.name).includes(session.name)) {
      return { ...session.toObject() };
    }
    return session;
  });

  for (let session of sessionObj) {
    if (session._id && cohortIds.includes(session._id.toString())) {
      session.numberOfCandidates = agg.find(({ _id }) => _id === session.name)?.candidates || 0;
      session.numberOfValidated = agg.find(({ _id }) => _id === session.name)?.validated || 0;
      session.goal = goals.find(({ _id }) => _id === session.name)?.total;
      session.goalReached = session.goal <= 0 ? true : session.numberOfCandidates + session.numberOfValidated >= session.goal * session.buffer;
      session.isFull = session.goal <= 0 ? true : session.numberOfValidated >= session.goal;
      session.isEligible = sessions.some((e) => e.name === session.name);
    }
  }

  // @ts-ignore
  return sessionObj;
}

export async function getCohortsEndAfter(date) {
  try {
    return CohortModel.find({ dateEnd: { $gte: date } });
  } catch (err) {
    return [];
  }
}

export async function getCohortNamesEndAfter(date) {
  const cohorts = await getCohortsEndAfter(date);
  return cohorts.map((cohort) => cohort.name);
}

export async function getCohortDateInfo(cohortName) {
  try {
    return CohortModel.findOne({ name: cohortName }, { validationDate: 1, validationDateForTerminaleGrade: 1, daysToValidate: 1, daysToValidateForTerminalGrade: 1, dateStart: 1 });
  } catch (err) {
    return {};
  }
}

export async function getCohortValidationDate(cohortName) {
  try {
    return CohortModel.findOne({ name: cohortName }, { validationDate: 1, validationDateForTerminaleGrade: 1 });
  } catch (err) {
    return {};
  }
}

export function getDepartureDateSession(session, young, cohort) {
  if (session?.dateStart) {
    const sessionDateStart = new Date(session.dateStart);
    sessionDateStart.setHours(sessionDateStart.getHours() + 12);
    return sessionDateStart;
  }
  if (young.cohort === "Juillet 2023" && [...regionsListDROMS, "Polynésie française"].includes(young.region)) {
    return new Date(2023, 6, 4);
  }
  const cohortDateStart = new Date(cohort?.dateStart);
  cohortDateStart.setHours(cohortDateStart.getHours() + 12);
  return new Date(cohortDateStart);
}

export function getReturnDateSession(session, young, cohort) {
  if (session?.dateEnd) {
    const sessionDateEnd = new Date(session.dateEnd);
    sessionDateEnd.setHours(sessionDateEnd.getHours() + 12);
    return sessionDateEnd;
  }
  if (young?.cohort === "Juillet 2023" && [...regionsListDROMS, "Polynésie française"].includes(young.region)) {
    return new Date(2023, 6, 16);
  }
  const cohortDateEnd = new Date(cohort?.dateEnd);
  cohortDateEnd.setHours(cohortDateEnd.getHours() + 12);
  return new Date(cohortDateEnd);
}
