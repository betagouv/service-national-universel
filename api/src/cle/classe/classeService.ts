import crypto from "crypto";
import { YOUNG_STATUS } from "snu-lib";

import { ClasseDocument, ClasseModel, ClasseType, EtablissementDocument, EtablissementType, ReferentType, YoungModel } from "../../models";
import { findYoungsByClasseId, generateConvocationsForMultipleYoungs } from "../../young/youngService";

import { mapRegionToTrigramme } from "../../services/regionService";

export const generateConvocationsByClasseId = async (classeId: string) => {
  const youngsInClasse = await findYoungsByClasseId(classeId);

  return await generateConvocationsForMultipleYoungs(youngsInClasse);
};

export const deleteClasse = async (_id: string, fromUser: object) => {
  let classe = await ClasseModel.findById(_id);
  if (!classe) throw new Error("Classe not found");
  if (classe.deletedAt) throw new Error("Classe already deleted");
  if (classe.cohesionCenterId) throw new Error("Classe already linked to a cohesion center");
  if (classe.sessionId) throw new Error("Classe already linked to a session");
  if (classe.ligneId) throw new Error("Classe already linked to a bus line");

  const students = await YoungModel.find({
    classeId: classe._id,
    status: { $in: [YOUNG_STATUS.IN_PROGRESS, YOUNG_STATUS.WAITING_CORRECTION, YOUNG_STATUS.WAITING_VALIDATION, YOUNG_STATUS.VALIDATED] },
  });

  const studentsValidated = students.filter((student) => student.status === YOUNG_STATUS.VALIDATED);
  if (studentsValidated.length > 0) throw new Error("Classe has validated students");

  // Deelete classe
  classe.set({ deletedAt: Date.now() });
  classe = await classe.save({ fromUser });

  // Set all students in "Inscription abandonnée"
  await Promise.all(
    students.map((s) => {
      s.set({
        status: YOUNG_STATUS.ABANDONED,
        lastStatusAt: Date.now(),
        withdrawnMessage: "classe supprimée",
        withdrawnReason: "other",
      });
      return s.save({ fromUser });
    }),
  );

  return classe;
};

export const buildUniqueClasseId = (etablissement: Pick<EtablissementType, "uai">, classe: Pick<ClasseType, "name" | "coloration" | "estimatedSeats">, originId = ""): string => {
  let hash = crypto
    .createHash("sha256")
    .update(`${etablissement?.uai}${classe?.name}${classe?.coloration}${classe?.estimatedSeats}${originId}` || "NAME")
    .digest("hex");
  if (!etablissement?.uai || !classe?.name || !classe?.coloration) {
    hash = "NO_UID";
  }
  const subHash = hash?.toString()?.substring(0, 6)?.toUpperCase();
  return `${subHash}`;
};

export const buildUniqueClasseKey = (etablissement: EtablissementType): string => {
  const trigrammeRegion = mapRegionToTrigramme(etablissement.region) || "REG";
  const departmentNumber = `0${(etablissement.zip || "DP")?.substring(0, 2)}`;
  const academy = (etablissement.academy || "A")?.substring(0, 1);

  return `C-${trigrammeRegion}${academy}${departmentNumber}`;
};

export const findClasseByUniqueKeyAndUniqueId = async (uniqueKey: string | undefined | null, uniqueId: string): Promise<ClasseDocument | null> => {
  return await ClasseModel.findOne({ uniqueKey, uniqueId });
};

export const getNumberOfClassesByEtablissement = async (etablissement: EtablissementDocument): Promise<number> => {
  return await ClasseModel.countDocuments({ etablissementId: etablissement._id });
};

export const getEstimatedSeatsByEtablissement = async (etablissement: EtablissementDocument): Promise<number> => {
  const classes = await ClasseModel.find({ etablissementId: etablissement._id });
  return classes.reduce((classeNumberAcc: number, classe: ClasseDocument) => classeNumberAcc + classe.estimatedSeats, 0);
};

export const updateReferent = async (classeId: string, referent: Pick<ReferentType, "firstName" | "lastName" | "email">, fromUser: object) => {
  const classe = await ClasseModel.findById(classeId);
  const referentClasseIds = classe?.referentClasseIds || [];
};
