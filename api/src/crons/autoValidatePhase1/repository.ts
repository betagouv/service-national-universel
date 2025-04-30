import { COHORT_STATUS, YOUNG_STATUS, YOUNG_STATUS_PHASE1 } from "snu-lib";
import { CohortDocument, CohortModel, YoungModel } from "../../models";

export async function getSejoursEnCoursDeRealisation(date: Date): Promise<CohortDocument[]> {
  const now = date.toISOString();
  const cohortsAVenir = ["CLE 23-24", "2025 CLE Globale"];
  return await CohortModel.find({
    dateStart: { $lte: now },
    dateEnd: { $gt: now },
    name: { $nin: cohortsAVenir },
    status: COHORT_STATUS.PUBLISHED,
  });
}

export function getCursorPourJeunesAValiderByCohortId(cohortId: string) {
  return YoungModel.find({
    cohortId,
    status: YOUNG_STATUS.VALIDATED,
    statusPhase1: YOUNG_STATUS_PHASE1.AFFECTED,
    $or: [{ cohesionStayPresence: { $in: ["true", "false"] } }, { departSejourAt: { $exists: true } }],
    // On ne prend pas les volontaires qui n'ont pas encore été pointés, ils seront validés manuellement par le chef de centre.
  }).cursor();
}
