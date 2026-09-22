import { ROLES, UserDto, ReferentType, PERMISSION_RESOURCES, isAdmin, isResponsibleOrSupervisor, isWriteAuthorized, region2department, department2region } from "snu-lib";

import { ApplicationModel, ClasseModel, CohesionCenterModel, EtablissementModel, MissionModel, SessionPhase1Model, StructureModel } from "../models";

type Geography = { region?: string | null; departments: string[] };

const EMPTY_GEOGRAPHY: Geography = { region: null, departments: [] };

/**
 * Région / départements d'un référent, résolus uniquement à partir de données serveur.
 *
 * Les chefs de centre n'ont ni `region` ni `department` (cf. `cleanReferentData`) : leur périmètre
 * est celui de leur centre de cohésion. Les responsables/superviseurs n'en ont pas non plus : c'est
 * celui de leur structure.
 */
export async function getReferentGeography(referent: Pick<ReferentType, "region" | "department" | "cohesionCenterId" | "sessionPhase1Id" | "structureId">): Promise<Geography> {
  const departments = (referent.department || []).filter(Boolean) as string[];
  if (referent.region || departments.length) {
    return { region: referent.region, departments };
  }

  if (referent.cohesionCenterId) {
    const center = await CohesionCenterModel.findById(referent.cohesionCenterId);
    if (center) return { region: center.region, departments: [center.department].filter(Boolean) as string[] };
  }

  if (referent.sessionPhase1Id) {
    const session = await SessionPhase1Model.findById(referent.sessionPhase1Id);
    const center = session?.cohesionCenterId ? await CohesionCenterModel.findById(session.cohesionCenterId) : null;
    if (center) return { region: center.region, departments: [center.department].filter(Boolean) as string[] };
  }

  if (referent.structureId) {
    const structure = await StructureModel.findById(referent.structureId);
    if (structure) return { region: structure.region, departments: [structure.department].filter(Boolean) as string[] };
  }

  return EMPTY_GEOGRAPHY;
}

type InvitationScope = {
  structureId?: string | null;
  region?: string | null;
  department?: string[] | null;
  cohesionCenterId?: string | null;
};

/**
 * Périmètre d'une invitation : le compte créé ne doit jamais être rattaché à une structure,
 * une géographie ou un centre hors du périmètre de l'invitant.
 *
 * `canInviteUser` ne contrôle que le couple de rôles ; sans ce contrôle, un responsable de structure
 * s'invite lui-même sur n'importe quelle structure et un référent départemental se crée un compte
 * de périmètre national.
 */
export async function isInvitationInUserScope(user: UserDto, invitation: InvitationScope): Promise<boolean> {
  if (isAdmin(user)) return true;

  if (invitation.structureId) {
    const structure = await StructureModel.findById(invitation.structureId);
    if (!structure) return false;
    if (!isWriteAuthorized({ user, resource: PERMISSION_RESOURCES.STRUCTURE, context: { structure: structure.toJSON() } })) return false;
  } else if (isResponsibleOrSupervisor(user)) {
    // Un responsable / superviseur n'invite que dans une structure de son périmètre.
    return false;
  }

  if (isResponsibleOrSupervisor(user)) return true;

  if ([ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(user.role)) {
    const allowedDepartments: string[] = user.role === ROLES.REFERENT_REGION ? region2department[user.region!] || [] : (user.department as string[]) ?? [];
    if (invitation.region && invitation.region !== user.region) return false;
    const requestedDepartments = (invitation.department || []).filter(Boolean) as string[];
    if (requestedDepartments.some((department) => !allowedDepartments.includes(department))) return false;
    if (invitation.cohesionCenterId) {
      const center = await CohesionCenterModel.findById(invitation.cohesionCenterId);
      if (!center) return false;
      if (user.role === ROLES.REFERENT_REGION ? center.region !== user.region : !allowedDepartments.includes(center.department!)) return false;
    }
    return true;
  }

  return false;
}

/**
 * Périmètre faisant foi pour agir sur un compte référent.
 *
 * `canUpdateReferent` (snu-lib) ne porte que la matrice des rôles et est partagé avec le front :
 * il ne peut pas arbitrer le périmètre (il ne lit pas la base et reçoit une structure issue de la
 * requête). Ce contrôle-ci complète la matrice et n'utilise que l'état serveur de la cible.
 */
export async function isReferentInUserScope(user: UserDto, target: ReferentType): Promise<boolean> {
  if (isAdmin(user)) return true;
  if (user._id?.toString() === target._id?.toString()) return true;

  // Responsable / superviseur : la cible doit appartenir à une structure de leur périmètre
  // (leur structure, et le réseau pour un superviseur) via la policy STRUCTURE.
  if (isResponsibleOrSupervisor(user)) {
    if (!target.structureId) return false;
    const structure = await StructureModel.findById(target.structureId);
    if (!structure) return false;
    return isWriteAuthorized({ user, resource: PERMISSION_RESOURCES.STRUCTURE, context: { structure: structure.toJSON() } });
  }

  if ([ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(user.role)) {
    const { region, departments } = await getReferentGeography(target);
    if (user.role === ROLES.REFERENT_REGION) {
      if (region && region === user.region) return true;
      return departments.some((department) => (region2department[user.region!] || []).includes(department));
    }
    return departments.some((department) => ((user.department as string[]) || []).includes(department));
  }

  return false;
}

/** Deux périmètres géographiques se recouvrent s'ils partagent une région ou un département. */
function geographiesOverlap(actor: Geography, target: Geography): boolean {
  if (actor.region && target.region && actor.region === target.region) return true;
  const actorDepartments = new Set([...actor.departments, ...(actor.region ? region2department[actor.region] || [] : [])]);
  if (target.departments.some((department) => actorDepartments.has(department))) return true;
  // La cible ne porte qu'une région, l'acteur qu'un département (ou l'inverse).
  if (target.region && actor.departments.some((department) => department2region[department] === target.region)) return true;
  return false;
}

/** Établissement de rattachement d'un acteur CLE : coordinateur/référent d'établissement, ou référent d'une de ses classes. */
async function getActorEtablissement(user: UserDto) {
  const direct = await EtablissementModel.findOne({ $or: [{ coordinateurIds: user._id }, { referentEtablissementIds: user._id }] });
  if (direct) return direct;

  const classe = await ClasseModel.findOne({ referentClasseIds: user._id });
  if (!classe?.etablissementId) return null;
  return EtablissementModel.findById(classe.etablissementId);
}

/**
 * Périmètre de lecture d'un compte référent.
 *
 * `canViewReferent` (snu-lib) ne porte que la matrice des rôles : il autorise par exemple tout
 * responsable à lire tout responsable de France. Ce contrôle-ci ajoute l'appartenance, en reprenant
 * la règle métier de référence — celle de l'annuaire Elasticsearch (`buildReferentContext`) — pour
 * que la fiche d'un référent ne soit jamais lisible en dehors de la liste où il apparaît.
 *
 * Il est volontairement distinct de `isReferentInUserScope` (écriture) : la matrice d'écriture
 * n'ouvre qu'aux admins, responsables/superviseurs, référents dép./rég. et à soi-même, alors que la
 * lecture couvre aussi la famille chef de centre et les rôles CLE.
 */
export async function isReferentReadableByUser(user: UserDto, target: ReferentType): Promise<boolean> {
  if (isAdmin(user)) return true;
  if (user._id?.toString() === target._id?.toString()) return true;

  // Même périmètre qu'en écriture : structure (et réseau) pour les responsables, géographie pour les référents.
  if (isResponsibleOrSupervisor(user) || [ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(user.role)) {
    return isReferentInUserScope(user, target);
  }

  // Chef de centre, adjoint, référent sanitaire : le périmètre de leur centre.
  if ([ROLES.HEAD_CENTER, ROLES.HEAD_CENTER_ADJOINT, ROLES.REFERENT_SANITAIRE].includes(user.role)) {
    const [actorGeography, targetGeography] = await Promise.all([getReferentGeography(user as any), getReferentGeography(target)]);
    return geographiesOverlap(actorGeography, targetGeography);
  }

  // Administrateur CLE, référent de classe : leur établissement, plus les référents départementaux de son département.
  if ([ROLES.ADMINISTRATEUR_CLE, ROLES.REFERENT_CLASSE].includes(user.role)) {
    const etablissement = await getActorEtablissement(user);
    if (!etablissement) return false;

    const targetId = target._id?.toString();
    const membresEtablissement = [...(etablissement.referentEtablissementIds || []), ...(etablissement.coordinateurIds || [])].map(String);
    if (targetId && membresEtablissement.includes(targetId)) return true;

    const classes = await ClasseModel.find({ etablissementId: etablissement._id }).select({ referentClasseIds: 1 });
    if (targetId && classes.some((classe) => (classe.referentClasseIds || []).map(String).includes(targetId))) return true;

    return target.role === ROLES.REFERENT_DEPARTMENT && !!etablissement.department && (target.department || []).includes(etablissement.department);
  }

  return false;
}

/**
 * Périmètre d'envoi d'un email à un tuteur de mission (`POST /referent/:tutorId/email/:template`).
 *
 * `canSendTutorTemplate` (snu-lib) ne teste que le rôle de l'appelant : un responsable de structure
 * ou un référent départemental pouvait écrire, depuis l'expéditeur officiel du SNU et avec un texte
 * libre, à n'importe quel référent du pays (constat M67).
 *
 * Trois liens légitimes existent : le tuteur appartient au périmètre de l'appelant (sa structure pour
 * un responsable, sa géographie pour un référent) ; il encadre une mission du territoire que
 * l'appelant instruit — cas des modèles MISSION_REFUSED / MISSION_WAITING_CORRECTION, envoyés
 * précisément depuis l'écran d'instruction de la mission ; ou il encadre une mission à laquelle a
 * candidaté un volontaire du territoire.
 */
export async function canContactTutorInScope(user: UserDto, tutor: ReferentType): Promise<boolean> {
  if (await isReferentInUserScope(user, tutor)) return true;

  if ([ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(user.role)) {
    const tutorId = tutor._id?.toString();
    const territoire = user.role === ROLES.REFERENT_REGION ? { region: user.region } : { department: { $in: (user.department as string[]) || [] } };
    if (await MissionModel.exists({ tutorId, ...territoire })) return true;

    // Le tuteur encadre une mission à laquelle a candidaté un volontaire du territoire : c'est le
    // cas de MILITARY_PREPARATION_DOCS_VALIDATED, envoyé depuis le dossier du volontaire, dont la
    // mission peut relever d'un autre département.
    const departements = user.role === ROLES.REFERENT_REGION ? region2department[user.region!] || [] : (user.department as string[]) ?? [];
    if (!departements.length) return false;
    return !!(await ApplicationModel.exists({ tutorId, youngDepartment: { $in: departements } }));
  }

  return false;
}
