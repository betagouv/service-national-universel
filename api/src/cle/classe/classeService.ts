import crypto from "crypto";
import { ERRORS, FUNCTIONAL_ERRORS, InvitationType, isSuperAdmin, ReferentCreatedBy, ROLES, STATUS_CLASSE, SUB_ROLES, YOUNG_STATUS, ClasseCertificateKeys } from "snu-lib";

import { ClasseDocument, ClasseModel, ClasseType, EtablissementDocument, EtablissementType, ReferentModel, ReferentType, YoungModel } from "../../models";
import { findYoungsByClasseId, generateConvocationsForMultipleYoungs, generateImageRightForMultipleYoungs, generateConsentementForMultipleYoungs } from "../../young/youngService";

import { mapRegionToTrigramme } from "../../services/regionService";

export type UpdateReferentClasse = Pick<ReferentType, "firstName" | "lastName" | "email">;

export const generateCertificateByKey = async (key: string, id: string) => {
  let certificates;
  if (key === ClasseCertificateKeys.IMAGE) {
    certificates = await generateImageRightByClasseId(id);
  }
  if (key === ClasseCertificateKeys.CONSENT) {
    certificates = await generateConsentementByClasseId(id);
  }
  if (key === ClasseCertificateKeys.CONVOCATION) {
    certificates = await generateConvocationsByClasseId(id);
  }
  return certificates;
};

export const generateConvocationsByClasseId = async (classeId: string) => {
  const youngsInClasse = await findYoungsByClasseId(classeId);

  return await generateConvocationsForMultipleYoungs(youngsInClasse);
};

export const generateImageRightByClasseId = async (classeId: string) => {
  const youngsInClasse = await findYoungsByClasseId(classeId);

  return await generateImageRightForMultipleYoungs(youngsInClasse);
};

export const generateConsentementByClasseId = async (classeId: string) => {
  const youngsInClasse = await findYoungsByClasseId(classeId);

  return await generateConsentementForMultipleYoungs(youngsInClasse);
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

export const getClasseById = async (classeId, withPopulate = true) => {
  let query = ClasseModel.findById(classeId);

  if (withPopulate) {
    query = query
      .populate({ path: "etablissement", options: { select: { referentEtablissementIds: 0, coordinateurIds: 0, createdAt: 0, updatedAt: 0 } } })
      .populate({ path: "referents", options: { select: { firstName: 1, lastName: 1, role: 1, email: 1 } } })
      .populate({ path: "cohesionCenter", options: { select: { name: 1, address: 1, zip: 1, city: 1, department: 1, region: 1 } } })
      .populate({ path: "session", options: { select: { _id: 1 } } })
      .populate({ path: "pointDeRassemblement", options: { select: { name: 1, address: 1, zip: 1, city: 1, department: 1, region: 1 } } })
      .populate({ path: "cohortDetails", options: { select: { dateStart: 1, dateEnd: 1 } } });
  }

  const classe = await query.exec();

  if (!classe) {
    return null;
  }

  return classe;
};

export const getClasseByIdPublic = async (classeId, withPopulate = true) => {
  let query = ClasseModel.findById(classeId);

  if (withPopulate) {
    query = query
      .populate({ path: "referents", options: { select: { firstName: 1, lastName: 1 } } })
      .populate({ path: "cohortDetails", options: { select: { dateStart: 1, dateEnd: 1 } } })
      .populate({ path: "etablissement", options: { select: { name: 1, schoolYear: 1 } } });
  }

  const classe = await query.exec();

  if (!classe) {
    return null;
  }

  return classe;
};

export const updateReferentByClasseId = async (classeId: string, newReferent: UpdateReferentClasse, fromUser: object) => {
  const classe = await ClasseModel.findById(classeId);
  const referent = await ReferentModel.findOne({ email: newReferent.email });

  if (referent) {
    if (![ROLES.REFERENT_CLASSE, ROLES.ADMINISTRATEUR_CLE].includes(referent?.role || "")) {
      throw new Error(FUNCTIONAL_ERRORS.CANNOT_BE_ADDED_AS_A_REFERENT_CLASSE);
    }
    classe?.set({ referentClasseIds: [referent._id] });
    referent.set({ firstName: newReferent.firstName, lastName: newReferent.lastName });
    await referent.save({ fromUser });
    return classe?.save({ fromUser });
  }
  const newReferentClasse = {
    role: ROLES.REFERENT_CLASSE,
    metadata: { invitationType: InvitationType.INSCRIPTION, createdBy: ReferentCreatedBy.UPDATE_REFERENT_2024_2025, isFirstInvitationPending: true },
    firstName: newReferent.firstName,
    lastName: newReferent.lastName,
    email: newReferent.email,
  };

  const newReferentClasseCreated = await ReferentModel.create(newReferentClasse);
  classe?.set({ referentClasseIds: [newReferentClasseCreated._id] });
  return classe?.save({ fromUser });
};

export const canUpdateReferentClasseBasedOnStatus = async (user, classeId: string) => {
  if (!isSuperAdmin(user)) {
    const isClasseCreated = await isClasseStatusCreated(classeId);
    if (!isClasseCreated) {
      throw new Error(FUNCTIONAL_ERRORS.CANNOT_BE_ADDED_AS_A_REFERENT_CLASSE);
    }
  }
  return true;
};

export const isClasseStatusCreated = async (classeId: string) => {
  const classe = await ClasseModel.findById(classeId);
  if (!classe) {
    throw new Error(ERRORS.CLASSE_NOT_FOUND);
  }
  return classe.status === STATUS_CLASSE.CREATED;
};

