import { CleEtablissementModel, LigneBusModel, ReferentModel, CohesionCenterModel, PointDeRassemblementModel, YoungModel } from "../models";
import { serializeReferent, serializeYoung } from "../utils/serializer";

import { findYoungsByClasseId, generateConvocationsForMultipleYoungs } from "../young/young.service";

export const generateConvocationsByClasseId = async (classeId: string) => {
  const youngsInClasse = await findYoungsByClasseId(classeId);

  return await generateConvocationsForMultipleYoungs(youngsInClasse);
};

export const findEtablissementsForClasses = async (classes) => {
  const etablissementIds = classes.map(({ etablissementId }) => etablissementId).filter(Boolean);
  const etablissements = await CleEtablissementModel.find({ _id: { $in: etablissementIds } });
  return etablissements;
};

export const findCohesionCentersForClasses = async (classes) => {
  const cohesionCenterIds = classes.map(({ cohesionCenterId }) => cohesionCenterId).filter(Boolean);
  const cohesionCenters = await CohesionCenterModel.find({ _id: { $in: cohesionCenterIds } });
  return cohesionCenters;
};

export const findPdrsForClasses = async (classes) => {
  const pdrIds = classes.map(({ pointDeRassemblementId }) => pointDeRassemblementId).filter(Boolean);
  const pdrs = await PointDeRassemblementModel.find({ _id: { $in: pdrIds } });
  return pdrs;
};

export const getYoungsGroupByClasses = async (classes) => {
  const classesIds = classes.map(({ _id }) => _id).filter(Boolean);
  const youngs = await YoungModel.find({ classeId: { $in: classesIds } });

  // group youngs by classe
  return youngs.reduce((acc, young) => {
    if (!acc[young.classeId]) {
      acc[young.classeId] = [];
    }
    acc[young.classeId].push(serializeYoung(young));
    return acc;
  }, {});
};

export const findLigneInfoForClasses = async (classes) => {
  const ligneIds = classes.map(({ ligneId }) => ligneId).filter(Boolean);
  return await LigneBusModel.find({ _id: { $in: ligneIds } });
};

export const findReferentInfoForClasses = async (classes) => {
  const refIds = classes.map(({ referentClasseIds }) => referentClasseIds).filter(Boolean);
  const referents = await ReferentModel.find({ _id: { $in: refIds } });
  return referents.map(serializeReferent);
};
