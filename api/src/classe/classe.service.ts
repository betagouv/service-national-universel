import { findYoungsByClasseId, generateConvocationsForMultipleYoungs } from "../young/young.service";
import { CleEtablissementModel, LigneBusModel, ReferentModel, CohesionCenterModel, PointDeRassemblementModel, YoungModel } from "@/models";

export const generateConvocationsByClasseId = async (classeId: string) => {
  const youngsInClasse = await findYoungsByClasseId(classeId);

  return await generateConvocationsForMultipleYoungs(youngsInClasse);
};

export const findEtablissementsForClasses = async (classes) => {
  const etablissementIds = classes.map(({ etablissementId }) => etablissementId);
  const etablissements = await CleEtablissementModel.find({ _id: { $in: etablissementIds } });
  return etablissements;
};

export const findCohesionCentersForClasses = async (classes) => {
  const cohesionCenterIds = classes.map(({ cohesionCenterId }) => cohesionCenterId);
  const cohesionCenters = await CohesionCenterModel.find({ _id: { $in: cohesionCenterIds } });
  return cohesionCenters;
};

export const findPdrsForClasses = async (classes) => {
  const pdrIds = classes.map(({ pointDeRassemblementId }) => pointDeRassemblementId);
  const pdrs = await PointDeRassemblementModel.find({ _id: { $in: pdrIds } });
  return pdrs;
};

export const findYoungsForClasses = async (classes) => {
  const classesIds = classes.map(({ _id }) => _id);
  const students = await YoungModel.find({ classeId: { $in: classesIds } });

  //count students by class
  const youngs = students.reduce((acc, cur) => {
    if (!acc[cur.classeId]) {
      acc[cur.classeId] = [];
    }
    acc[cur.classeId].push(cur);
    return acc;
  }, {});

  return youngs;
};

export const findLigneInfoForClasses = async (classes) => {
  const ligneIds = classes.map(({ ligneId }) => ligneId);
  return await LigneBusModel.find({ _id: { $in: ligneIds } });
};

export const findReferentInfoForClasses = async (classes) => {
  const refIds = classes.map(({ referentClasseIds }) => referentClasseIds);
  const referents = await ReferentModel.find({ _id: { $in: refIds } });
  // const referentsData = serializeReferents(referents);
  return referents;
};
