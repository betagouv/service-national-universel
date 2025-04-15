import { YOUNG_STATUS, YOUNG_STATUS_PHASE1 } from "snu-lib";
import { CohortDocument, CohortModel, YoungModel } from "../../models";

export async function getCurrentCohorts(date: Date): Promise<CohortDocument[]> {
  const now = date.toISOString();
  const cohortsAVenir = ["CLE 23-24", "2025 CLE Globale"];
  return await CohortModel.find({
    $and: [{ dateStart: { $lte: now } }, { dateEnd: { $gte: now } }, { name: { $nin: cohortsAVenir } }],
  });
}

export function getYoungCursorByCohortId(cohortId: string) {
  return YoungModel.find({ cohortId, status: YOUNG_STATUS.VALIDATED, statusPhase1: YOUNG_STATUS_PHASE1.AFFECTED }).cursor();
}
