import api from "../services/api";
import { capture } from "../sentry";

let cohorts = null;
let cohortsCachedAt = null;

export async function cohortsInit() {
  try {
    const result = await api.get("/cohorts");
    if (!result.ok) {
      capture("Unable to load global cohorts data");
    } else {
      cohorts = result.data;
      cohortsCachedAt = Date.now();
    }
  } catch (err) {
    capture(err);
  }
}

export function isCohortsInitialized() {
  return cohortsCachedAt !== null;
}

export function getCohort(id) {
  if (isCohortsInitialized()) {
    return cohorts.find((c) => c.snuId === id);
  } else {
    return undefined;
  }
}

export function cohortAssignmentAnnouncementsIsOpen(cohortId) {
  if (isCohortsInitialized()) {
    const cohort = getCohort(cohortId);
    if (cohort) {
      return cohort.assignmentAnnouncementsOpen === "true";
    }
  }

  return false;
}
