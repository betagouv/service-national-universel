import { ROLES, UserDto, YoungType, canEditYoung } from "snu-lib";

import { ApplicationModel, ClasseModel, SessionPhase1Model, StructureModel } from "../models";
import { getResponsibleCenterField } from "../controllers/elasticsearch/utils";

const HEAD_CENTER_ROLES: string[] = [ROLES.HEAD_CENTER, ROLES.HEAD_CENTER_ADJOINT, ROLES.REFERENT_SANITAIRE];
const CLE_ROLES: string[] = [ROLES.REFERENT_CLASSE, ROLES.ADMINISTRATEUR_CLE];

/**
 * Périmètre d'un chef de centre (ou de ses adjoints) : le volontaire doit être affecté à une session
 * dont l'utilisateur est chef de centre / adjoint. Le lien passe par `SessionPhase1`, seule source
 * fiable (le `sessionPhase1Id` porté par le référent n'est pas maintenu).
 */
async function isYoungInHeadCenterScope(user: UserDto, young: Pick<YoungType, "sessionPhase1Id">): Promise<boolean> {
  if (!young.sessionPhase1Id) return false;
  const field = getResponsibleCenterField(user.role);
  if (!field) return false;
  const session = await SessionPhase1Model.findOne({ _id: young.sessionPhase1Id, [field]: user._id!.toString() });
  return !!session;
}

/**
 * Périmètre d'un référent de classe / administrateur CLE : le volontaire doit appartenir à une classe
 * dont l'utilisateur est référent, ou à un établissement dont il est chef ou coordinateur.
 */
async function isYoungInCleScope(user: UserDto, young: Pick<YoungType, "classeId">): Promise<boolean> {
  if (!young.classeId) return false;
  const classe = await ClasseModel.findById(young.classeId).populate({
    path: "etablissement",
    options: { select: { coordinateurIds: 1, referentEtablissementIds: 1 } },
  });
  if (!classe) return false;
  const userId = user._id!.toString();
  const etablissement: any = (classe as any).etablissement;
  return classe.referentClasseIds.includes(userId) || !!etablissement?.referentEtablissementIds?.includes(userId) || !!etablissement?.coordinateurIds?.includes(userId);
}

/**
 * Autorisation d'édition d'un volontaire, périmètre compris.
 *
 * `canEditYoung` (snu-lib) n'est qu'une matrice de rôles : elle autorise tout chef de centre sur tout
 * volontaire, et tout référent CLE sur tout volontaire `source: CLE`. Le rattachement réel (session,
 * classe, établissement) ne peut être vérifié qu'en base : c'est le rôle de cette fonction, qui doit
 * être utilisée à la place de `canEditYoung` sur les routes d'écriture.
 */
export async function canEditYoungInScope(user: UserDto, young: Pick<YoungType, "sessionPhase1Id" | "classeId" | "region" | "department" | "source">): Promise<boolean> {
  if (!canEditYoung(user, young)) return false;
  if (HEAD_CENTER_ROLES.includes(user.role)) return isYoungInHeadCenterScope(user, young);
  if (CLE_ROLES.includes(user.role)) return isYoungInCleScope(user, young);
  return true;
}

/**
 * Périmètre géographique d'un référent départemental / régional sur un volontaire.
 * Utilisé par les routes qui ne passent pas par `canEditYoung` (statuts de pièces phase 1).
 */
export function isYoungInReferentGeography(user: UserDto, young: Pick<YoungType, "region" | "department">): boolean {
  if (user.role === ROLES.REFERENT_REGION) return !!young.region && young.region === user.region;
  if (user.role === ROLES.REFERENT_DEPARTMENT) return !!young.department && ((user.department as string[]) || []).includes(young.department);
  return false;
}

/**
 * Périmètre d'un responsable / superviseur de structure : le volontaire doit avoir candidaté à une
 * mission portée par la structure de l'utilisateur (ou, pour un superviseur, par une structure de
 * son réseau). C'est le contrôle que `canDownloadYoungDocuments` laissait en commentaire.
 */
export async function isYoungInStructureScope(user: UserDto, young: Pick<YoungType, "_id">): Promise<boolean> {
  if (!user.structureId) return false;
  const structureIds = [user.structureId];
  if (user.role === ROLES.SUPERVISOR) {
    const networkStructures = await StructureModel.find({ networkId: user.structureId }, { _id: 1 });
    structureIds.push(...networkStructures.map((structure) => structure._id.toString()));
  }
  return !!(await ApplicationModel.exists({ youngId: young._id!.toString(), structureId: { $in: structureIds } }));
}

/**
 * Autorisation d'accès aux pièces d'un volontaire (liste, téléchargement, génération d'attestation),
 * périmètre compris.
 *
 * Remplace `canDownloadYoungDocuments` (snu-lib), qui autorisait tout RESPONSIBLE / SUPERVISOR sur
 * n'importe quel volontaire — le rapprochement avec les candidatures y était commenté (constat C15).
 */
export async function canAccessYoungDocumentsInScope(
  user: UserDto,
  young: Pick<YoungType, "_id" | "sessionPhase1Id" | "classeId" | "region" | "department" | "source">,
): Promise<boolean> {
  if (await canEditYoungInScope(user, young)) return true;
  if ([ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(user.role as any)) return isYoungInStructureScope(user, young);
  return false;
}
