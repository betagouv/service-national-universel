import { APPLICATION_STATUS, ROLES, UserDto, YoungType, canEditYoung, MILITARY_FILE_KEYS } from "snu-lib";

import { ApplicationModel, ClasseModel, SessionPhase1Model, StructureModel } from "../models";
import { getResponsibleCenterField } from "../controllers/elasticsearch/utils";

const HEAD_CENTER_ROLES: string[] = [ROLES.HEAD_CENTER, ROLES.HEAD_CENTER_ADJOINT, ROLES.REFERENT_SANITAIRE];
const CLE_ROLES: string[] = [ROLES.REFERENT_CLASSE, ROLES.ADMINISTRATEUR_CLE];
const GEO_ROLES: string[] = [ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION];

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
 * Périmètre d'un référent départemental / régional : le volontaire est de son territoire, ou affecté à
 * une session phase 1 de son territoire — mêmes deux cas que la recherche ES (buildYoungContext), pour
 * ne pas refuser en lecture un volontaire que le référent voit déjà dans ses listes.
 */
async function isYoungInReferentTerritory(user: UserDto, young: Pick<YoungType, "region" | "department" | "sessionPhase1Id">): Promise<boolean> {
  if (isYoungInReferentGeography(user, young)) return true;
  return isSessionInReferentTerritory(user, young.sessionPhase1Id);
}

async function isSessionInReferentTerritory(user: UserDto, sessionPhase1Id: string | undefined): Promise<boolean> {
  if (!sessionPhase1Id) return false;
  if (user.role === ROLES.REFERENT_REGION && !user.region) return false;
  const territoire = user.role === ROLES.REFERENT_REGION ? { region: user.region } : { department: { $in: (user.department as string[]) || [] } };
  return !!(await SessionPhase1Model.exists({ _id: sessionPhase1Id, ...territoire }));
}

/**
 * Rattachement d'une session phase 1 à l'acteur, pour les actions de masse sur les volontaires qui y
 * sont affectés (pointage, JDM, fiche sanitaire, départ) : chef de centre ou adjoint de la session,
 * référent départemental / régional du territoire de la session, admin. Tout autre rôle est refusé,
 * de même qu'un lot sans session pour qui n'est pas admin.
 */
export async function isSessionPhase1InUserScope(user: UserDto, sessionPhase1Id: string | undefined): Promise<boolean> {
  if (user.role === ROLES.ADMIN) return true;
  if (HEAD_CENTER_ROLES.includes(user.role)) return isYoungInHeadCenterScope(user, { sessionPhase1Id });
  if (GEO_ROLES.includes(user.role)) return isSessionInReferentTerritory(user, sessionPhase1Id);
  return false;
}

/**
 * Périmètre de LECTURE d'un volontaire (dossier, historique).
 *
 * Miroir en lecture de `canEditYoungInScope` : les rôles dont la matrice de permissions est nationale
 * (chef de centre, référent CLE) doivent être rattachés au volontaire en base, les référents
 * géographiques à son territoire. Tout rôle non listé est refusé : un rôle sans périmètre défini
 * (transporter, responsable de structure, comptes résiduels) n'a rien à faire dans le dossier d'un
 * volontaire, et l'ajouter doit être un choix explicite.
 */
export async function isYoungInUserScope(user: UserDto, young: Pick<YoungType, "region" | "department" | "classeId" | "sessionPhase1Id">): Promise<boolean> {
  if (user.role === ROLES.ADMIN) return true;
  if (HEAD_CENTER_ROLES.includes(user.role)) return isYoungInHeadCenterScope(user, young);
  if (CLE_ROLES.includes(user.role)) return isYoungInCleScope(user, young);
  if (GEO_ROLES.includes(user.role)) return isYoungInReferentTerritory(user, young);
  return false;
}

/**
 * Périmètre de LECTURE du dossier d'un volontaire côté référent (`GET /referent/young/:id`).
 *
 * `isYoungInUserScope` refuse par construction les responsables et superviseurs de structure, qui
 * n'ont pas de rattachement territorial ; ils consultent pourtant légitimement le dossier des
 * volontaires ayant candidaté à une de leurs missions. C'est le seul élargissement autorisé ici :
 * `canViewYoung` (snu-lib) ne contrôlait que le rôle, ouvrant le dossier de n'importe quel
 * volontaire à tout responsable, superviseur ou référent hors de son territoire (constat H67).
 */
export async function canViewYoungFileInScope(user: UserDto, young: Pick<YoungType, "_id" | "region" | "department" | "classeId" | "sessionPhase1Id">): Promise<boolean> {
  if (await isYoungInUserScope(user, young)) return true;
  if ([ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(user.role as any)) return isYoungInStructureScope(user, young);
  return false;
}

/**
 * Structures sur lesquelles un responsable / superviseur a autorité : la sienne, plus celles de son
 * réseau pour un superviseur (même découpage que les policies `structureId` / `networkId`).
 */
async function getActorStructureIds(user: UserDto): Promise<string[]> {
  if (!user.structureId) return [];
  const structureIds = [user.structureId];
  if (user.role === ROLES.SUPERVISOR) {
    const networkStructures = await StructureModel.find({ networkId: user.structureId }, { _id: 1 });
    structureIds.push(...networkStructures.map((structure) => structure._id.toString()));
  }
  return structureIds;
}

/**
 * Une proposition de mission (WAITING_ACCEPTATION) n'ouvre rien à la structure tant que le volontaire
 * ne l'a pas acceptée : ni son dossier, ni ses pièces, ni la candidature elle-même (PH11, PH1).
 */
const NOT_A_PROPOSAL = { status: { $ne: APPLICATION_STATUS.WAITING_ACCEPTATION } };

/**
 * Périmètre d'un responsable / superviseur de structure : le volontaire doit avoir candidaté à une
 * mission portée par la structure de l'utilisateur (ou, pour un superviseur, par une structure de
 * son réseau). C'est le contrôle que `canDownloadYoungDocuments` laissait en commentaire.
 */
export async function isYoungInStructureScope(user: UserDto, young: Pick<YoungType, "_id">): Promise<boolean> {
  const structureIds = await getActorStructureIds(user);
  if (!structureIds.length) return false;
  return !!(await ApplicationModel.exists({ youngId: young._id!.toString(), structureId: { $in: structureIds }, ...NOT_A_PROPOSAL }));
}

/**
 * Filtre Mongo à ajouter à `{ youngId }` pour ne joindre au dossier d'un volontaire que les
 * candidatures que l'utilisateur a le droit de voir.
 *
 * Un responsable / superviseur n'ouvre le dossier que parce que le volontaire a candidaté dans son
 * périmètre (`isYoungInStructureScope`) : les candidatures dans d'autres structures ne le regardent
 * pas, et `CANDIDATURE_READ` est seedée sans policy pour ces rôles (GOO-41). Les autres rôles
 * voient le dossier au titre de leur territoire ou de leur rattachement : toutes les candidatures
 * du volontaire relèvent alors de leur périmètre.
 */
export async function getApplicationScopeFilter(user: UserDto): Promise<{ structureId?: { $in: string[] }; status?: { $ne: string } }> {
  if (![ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(user.role as any)) return {};
  return { structureId: { $in: await getActorStructureIds(user) }, ...NOT_A_PROPOSAL };
}

/**
 * Périmètre d'un responsable / superviseur sur les pièces de préparation militaire : le volontaire
 * doit avoir candidaté à une mission portée par une structure de préparation militaire de son
 * périmètre.
 *
 * Le repli historique ne testait que `isMilitaryPreparation` sur la structure de l'acteur, sans
 * aucun lien avec le volontaire : tout responsable d'une structure PM pouvait télécharger les pièces
 * PM de n'importe quel volontaire (constat H66, audit 2026-09-21).
 */
export async function isYoungInMilitaryPreparationStructureScope(user: UserDto, young: Pick<YoungType, "_id">): Promise<boolean> {
  const structureIds = await getActorStructureIds(user);
  if (!structureIds.length) return false;
  const militaryStructures = await StructureModel.find({ _id: { $in: structureIds }, isMilitaryPreparation: "true" }, { _id: 1 });
  if (!militaryStructures.length) return false;
  return !!(await ApplicationModel.exists({
    youngId: young._id!.toString(),
    structureId: { $in: militaryStructures.map((structure) => structure._id.toString()) },
    ...NOT_A_PROPOSAL,
  }));
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

/**
 * Pièces hors de portée d'un responsable / superviseur même dans son périmètre : ce sont des
 * pièces de santé ou d'identité que la décision GOO-11 masque déjà côté fiche (`getYoungFieldsHiddenFrom`).
 * `autoTestPCRFiles` n'y figure pourtant pas (absent de `YOUNG_HEALTH_FIELDS`) : extension de
 * politique volontaire pour ce helper, pas un simple miroir du serializer (audit production 2026-09-25, PH20).
 */
const STRUCTURE_FORBIDDEN_FILE_KEYS: string[] = ["cniFiles", "autoTestPCRFiles"];

/**
 * Autorisation d'accès à UNE pièce précise du dossier d'un volontaire (téléchargement, liste).
 *
 * `canAccessYoungDocumentsInScope` ne connaît que le volontaire, pas la clé demandée : un
 * responsable ou superviseur en périmètre l'obtenait pour n'importe quelle clé, y compris cniFiles,
 * autoTestPCRFiles ou les pièces de préparation militaire hors structure de préparation militaire
 * (constat PH20, audit production 2026-09-25). Un acteur en périmètre d'édition (référent
 * territorial, chef de centre, référent CLE) garde accès à toute clé, comme aujourd'hui.
 */
export async function canAccessYoungFileKeyInScope(
  user: UserDto,
  young: Pick<YoungType, "_id" | "sessionPhase1Id" | "classeId" | "region" | "department" | "source">,
  key: string,
): Promise<boolean> {
  if (await canEditYoungInScope(user, young)) return true;
  if (![ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(user.role as any)) return false;
  if (MILITARY_FILE_KEYS.includes(key)) return isYoungInMilitaryPreparationStructureScope(user, young);
  if (STRUCTURE_FORBIDDEN_FILE_KEYS.includes(key)) return false;
  return isYoungInStructureScope(user, young);
}
