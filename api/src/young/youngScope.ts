import { ROLES, UserDto, YoungType, canEditYoung } from "snu-lib";

import { ClasseModel, SessionPhase1Model } from "../models";
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
