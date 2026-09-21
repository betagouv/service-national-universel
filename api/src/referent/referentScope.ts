import { ROLES, UserDto, ReferentType, PERMISSION_RESOURCES, isAdmin, isResponsibleOrSupervisor, isWriteAuthorized, region2department } from "snu-lib";

import { CohesionCenterModel, SessionPhase1Model, StructureModel } from "../models";

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
