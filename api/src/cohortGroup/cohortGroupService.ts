import { COHORT_TYPE, YOUNG_SOURCE, YoungType } from "snu-lib";
import { CohortGroupDocument, CohortGroupModel, CohortModel } from "../models";

export async function getCohortGroupsForYoung(young: YoungType): Promise<CohortGroupDocument[]> {
  const cohort = await CohortModel.findById(young.cohortId);
  if (!cohort) throw new Error("Cohort not found");

  const cohortGroup = await CohortGroupModel.findById(cohort.cohortGroupId);
  if (!cohortGroup) throw new Error("Cohort group not found");

  const query = {
    type: COHORT_TYPE.VOLONTAIRE,
    // On propose aux CLE désistés de se réinscrire sur l'année en cours, mais pas aux HTS.
    year: young.source === YOUNG_SOURCE.CLE ? { $gte: cohortGroup.year } : { $gt: cohortGroup.year },
  };

  return await CohortGroupModel.find(query).sort({ year: 1, name: 1 });
}
