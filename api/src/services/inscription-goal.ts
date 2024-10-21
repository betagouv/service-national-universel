import { department2region, FUNCTIONAL_ERRORS } from "snu-lib";
import { InscriptionGoalModel, YoungModel } from "../models";

interface CompletionObjectif {
  jeunesCount: number;
  objectif: number;
  tauxRemplissage: number;
  isAtteint: boolean;
}

// Vérification des objectifs pour une région donnée
export const getCompletionObjectifRegion = async (region: string, cohort: string): Promise<CompletionObjectif> => {
  const regionGoal = await InscriptionGoalModel.aggregate<{ _id: string; total: number }>([
    {
      $match: {
        region,
        cohort,
        max: { $ne: null },
      },
    },
    {
      $group: {
        _id: "region",
        total: {
          $sum: "$max",
        },
      },
    },
  ]);
  const total = regionGoal?.[0]?.total;
  if (!total) {
    throw new Error(FUNCTIONAL_ERRORS.INSCRIPTION_GOAL_NOT_DEFINED);
  }
  const jeunesCount = (await YoungModel.find({ region, status: { $in: ["VALIDATED"] }, cohort }).countDocuments()) || 0;
  const tauxRemplissage = jeunesCount / total;
  return { jeunesCount, objectif: total, tauxRemplissage, isAtteint: tauxRemplissage >= FILLING_RATE_LIMIT };
};

// Vérification des objectifs pour un département donné
export const getCompletionObjectifDepartement = async (department: string, cohort: string) => {
  const jeunesCount = (await YoungModel.find({ department, status: { $in: ["VALIDATED"] }, cohort }).countDocuments()) || 0;
  const objectif = await InscriptionGoalModel.findOne({ department, cohort });
  if (!objectif || !objectif.max) {
    throw new Error(FUNCTIONAL_ERRORS.INSCRIPTION_GOAL_NOT_DEFINED);
  }
  const tauxRemplissage = jeunesCount / objectif.max;
  return { jeunesCount, objectif: objectif.max, tauxRemplissage, isAtteint: tauxRemplissage >= FILLING_RATE_LIMIT };
};

// Vérification des objectifs pour un département et la région associée
export const getCompletionObjectifs = async (department: string, cohort: string) => {
  const completionObjectifDepartement = await getCompletionObjectifDepartement(department, cohort);
  const completionObjectifRegion = await getCompletionObjectifRegion(department2region[department], cohort);
  return {
    department: completionObjectifDepartement,
    region: completionObjectifRegion,
    // uniquement la région est utilisé pour la completion des objectifs
    isAtteint: completionObjectifRegion.isAtteint,
    tauxRemplissage: completionObjectifRegion.tauxRemplissage,
    tauxLimiteRemplissage: FILLING_RATE_LIMIT,
  };
};

//@TODO: move to snu-lib and use it in the admin as well
export const FILLING_RATE_LIMIT = 1;
