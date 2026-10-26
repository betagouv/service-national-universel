import { LigneBusModel, ReferentModel, CohesionCenterModel, PointDeRassemblementModel, YoungModel, ReferentDocument, YoungDocument } from "../../../models";
import { serializeYoung } from "../../../utils/serializer";
import { REFERENT_CLE_PUBLIC_FIELDS } from "../../referentProjection";

export const findCohesionCentersForClasses = async (classes) => {
  const cohesionCenterIds = classes.map(({ cohesionCenterId }) => cohesionCenterId).filter(Boolean);
  const cohesionCenters = await CohesionCenterModel.find({
    _id: { $in: cohesionCenterIds },
    deletedAt: { $exists: false },
  });
  return cohesionCenters;
};

export const findPdrsForClasses = async (classes) => {
  const pdrIds = classes.map(({ pointDeRassemblementId }) => pointDeRassemblementId).filter(Boolean);
  const pdrs = await PointDeRassemblementModel.find({ _id: { $in: pdrIds } });
  return pdrs;
};

export const getYoungsGroupByClasses = async (classes) => {
  const classesIds = classes.map(({ _id }) => _id).filter(Boolean);
  const youngs: Pick<YoungDocument, "_id" | "status" | "classeId">[] = await YoungModel.find({ classeId: { $in: classesIds } }).select({ _id: 1, status: 1, classeId: 1 });

  // group youngs by classe
  return youngs.reduce((acc, young) => {
    if (!acc[young.classeId!]) {
      acc[young.classeId!] = [];
    }
    acc[young.classeId!].push(serializeYoung(young));
    return acc;
  }, {});
};

export const findLigneInfoForClasses = async (classes) => {
  const ligneIds = classes.map(({ ligneId }) => ligneId).filter(Boolean);
  return await LigneBusModel.find({ _id: { $in: ligneIds } });
};

/**
 * `serializeReferent` retire bien les jetons, mais laisse passer tout le reste du document
 * (mobile, dernière connexion, territoire, métadonnées d'invitation, cohortes…). L'export n'a
 * besoin que de l'identité et du contact du chef d'établissement : projection explicite.
 */
export const findChefEtablissementInfoForClasses = async (classes): Promise<ReferentDocument[]> => {
  const chefIds = classes.map(({ etablissement }) => etablissement.referentEtablissementIds).filter(Boolean);
  return ReferentModel.find({ _id: { $in: chefIds } }).select(REFERENT_CLE_PUBLIC_FIELDS);
};
