import { COHORT_TYPE, YOUNG_SOURCE, YoungType } from "snu-lib";
import { CohortGroupDocument, CohortGroupModel, CohortModel } from "../models";

type Query = { type: string; year?: { $gte: number } | { $gt: number } };

export async function getCohortGroupsForYoung(young: YoungType): Promise<CohortGroupDocument[]> {
  const cohort = await CohortModel.findById(young.cohortId);
  if (!cohort) throw new Error("Cohort not found");

  const cohortGroup = await CohortGroupModel.findById(cohort.cohortGroupId);
  if (!cohortGroup) throw new Error("Cohort group not found");

  let query: Query = { type: COHORT_TYPE.VOLONTAIRE };

  // On propose aux CLE désistés de se ré inscrire sur l'année en cours, mais pas aux HTS.
  if (cohortGroup.name !== "Réserve") {
    if (!cohortGroup.year) throw new Error("Cohort group year is missing");
    query.year = young.source === YOUNG_SOURCE.CLE ? { $gte: cohortGroup.year } : { $gt: cohortGroup.year };
  }

  return await CohortGroupModel.find(query).sort({ year: 1, name: 1 });
}
