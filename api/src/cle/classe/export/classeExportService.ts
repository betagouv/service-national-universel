import { LigneBusModel, ReferentModel, CohesionCenterModel, PointDeRassemblementModel, YoungModel } from "../../../models";
import { serializeReferent, serializeYoung } from "../../../utils/serializer";

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
  const youngs = await YoungModel.find({ classeId: { $in: classesIds } }).select({ _id: 1, status: 1, classeId: 1 });

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
