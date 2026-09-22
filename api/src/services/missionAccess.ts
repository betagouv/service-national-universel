import { MISSION_STATUS, ROLES, UserDto, isAdmin } from "snu-lib";

import { ReferentModel, StructureModel } from "../models";
import { ERRORS } from "../utils";

/**
 * Périmètre de lecture d'une mission et champs qu'un rôle peut poser lui-même.
 *
 * `MISSION_READ` est seedée SANS policy pour le superviseur (migration 20250624122150). Jusqu'à la
 * précédence des policies introduite par H87 (#5343), `isReadAuthorized` répondait donc vrai pour
 * n'importe quelle mission ; depuis, il est cloisonnant — mais il le reste uniquement tant que la
 * permission scopée correspondante existe en base. Ce contrôle explicite ne dépend d'aucun seed :
 * il pose les mêmes axes que les policies d'écriture (structure pour le responsable, réseau pour le
 * superviseur) et refuse par défaut tout rôle sans périmètre.
 *
 * Le périmètre national des rôles administrateur / référent départemental / référent régional est
 * conservé tel quel : `MISSION_FULL` leur est seedée sans policy, et restreindre ces rôles sortirait
 * du cadre de ce correctif.
 */

type MissionScope = { structureId?: string | null };

const idRegex = /^[0-9a-fA-F]{24}$/;
const isObjectId = (value: unknown): value is string => typeof value === "string" && idRegex.test(value);

/** Rôles dont la permission MISSION est seedée sans policy : leur périmètre est national. */
const ROLES_WITH_NATIONAL_MISSION_SCOPE: string[] = [ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION];

/**
 * Statuts qu'un rôle peut poser lui-même, à l'image de ce que propose l'écran d'administration
 * (`SelectStatusMissionV2`) : la modération d'une mission (VALIDATED, REFUSED, WAITING_CORRECTION)
 * appartient aux référents, la structure porteuse ne fait que soumettre, annuler ou archiver.
 */
const MISSION_STATUS_BY_ROLE: Record<string, string[]> = {
  [ROLES.ADMIN]: Object.values(MISSION_STATUS),
  [ROLES.REFERENT_DEPARTMENT]: Object.values(MISSION_STATUS),
  [ROLES.REFERENT_REGION]: Object.values(MISSION_STATUS),
  [ROLES.RESPONSIBLE]: [MISSION_STATUS.DRAFT, MISSION_STATUS.WAITING_VALIDATION, MISSION_STATUS.CANCEL, MISSION_STATUS.ARCHIVED],
  [ROLES.SUPERVISOR]: [MISSION_STATUS.DRAFT, MISSION_STATUS.WAITING_VALIDATION, MISSION_STATUS.CANCEL, MISSION_STATUS.ARCHIVED],
};

/** Identifiants des structures du même réseau que `structureId`, elle comprise. */
async function getStructureNetworkIds(structureId?: string | null): Promise<string[]> {
  if (!isObjectId(String(structureId))) return [];
  const structure = await StructureModel.findById(String(structureId)).select({ _id: 1, networkId: 1 });
  if (!structure) return [];
  const rootId = isObjectId(structure.networkId) ? structure.networkId : String(structure._id);
  const network = await StructureModel.find({ $or: [{ _id: rootId }, { networkId: rootId }] }).select({ _id: 1 });
  return Array.from(new Set([String(structure._id), rootId, ...network.map((item) => String(item._id))]));
}

/** La mission relève-t-elle du périmètre de l'utilisateur ? Fail-closed pour tout rôle sans périmètre explicite. */
export async function isMissionInUserScope(user: UserDto, mission: MissionScope): Promise<boolean> {
  switch (user?.role) {
    case ROLES.ADMIN:
    case ROLES.REFERENT_DEPARTMENT:
    case ROLES.REFERENT_REGION:
      return true;

    case ROLES.RESPONSIBLE: {
      if (!user.structureId || !mission?.structureId) return false;
      return String(mission.structureId) === String(user.structureId);
    }

    case ROLES.SUPERVISOR: {
      if (!user.structureId || !mission?.structureId) return false;
      if (String(mission.structureId) === String(user.structureId)) return true;
      // Même règle que la policy d'écriture `MissionSameStructureFullNetwork` : la structure
      // porteuse appartient au réseau dont le superviseur est la tête.
      if (!isObjectId(String(mission.structureId))) return false;
      const structure = await StructureModel.findById(String(mission.structureId)).select({ networkId: 1 });
      return !!structure?.networkId && String(structure.networkId) === String(user.structureId);
    }

    default:
      return false;
  }
}

/** Un tuteur doit être un référent de la structure porteuse de la mission, ou d'une structure de son réseau. */
export async function isTutorAllowedForMission(tutorId: unknown, mission: MissionScope): Promise<boolean> {
  if (!isObjectId(String(tutorId)) || !mission?.structureId) return false;
  const tutor = await ReferentModel.findById(String(tutorId)).select({ structureId: 1 });
  if (!tutor?.structureId) return false;
  if (String(tutor.structureId) === String(mission.structureId)) return true;
  const network = await getStructureNetworkIds(mission.structureId);
  return network.includes(String(tutor.structureId));
}

type CheckMissionPayloadParams = {
  user: UserDto;
  /** Corps déjà validé par `validateMission`. Les champs dérivés en sont retirés sur place. */
  payload: Record<string, any>;
  /** Mission stockée, ou `null` à la création. */
  storedMission: (MissionScope & { placesLeft?: number | null }) | null;
};

/**
 * Borne les champs qu'un rôle peut poser dans le corps d'une création ou d'une modification de mission.
 *
 * Retourne un code d'erreur quand le corps demande une opération réservée, `null` sinon. Les champs
 * dérivés (`placesLeft`, `tutorName`) sont retirés du corps : ils sont recalculés par le contrôleur.
 */
export async function checkMissionPayload({ user, payload, storedMission }: CheckMissionPayloadParams): Promise<string | null> {
  const hasNationalScope = ROLES_WITH_NATIONAL_MISSION_SCOPE.includes(user?.role as string);

  // Statut : liste blanche par rôle, fail-closed pour tout rôle non listé.
  if (payload.status) {
    const allowedStatus = MISSION_STATUS_BY_ROLE[user?.role as string] || [];
    if (!allowedStatus.includes(payload.status)) return ERRORS.OPERATION_UNAUTHORIZED;
  }

  // La structure porteuse ne se change que par la route dédiée `PUT /mission/:id/structure/:structureId`.
  if (storedMission && payload.structureId && String(payload.structureId) !== String(storedMission.structureId || "") && !isAdmin(user)) {
    return ERRORS.OPERATION_UNAUTHORIZED;
  }

  const targetStructureId = payload.structureId || storedMission?.structureId;

  // Le tuteur doit appartenir à la structure porteuse (ou à son réseau).
  if (payload.tutorId && !(await isTutorAllowedForMission(payload.tutorId, { structureId: targetStructureId }))) {
    return ERRORS.OPERATION_UNAUTHORIZED;
  }

  // `placesLeft` est dérivé de `placesTotal` et des candidatures ; seuls les rôles au périmètre national le posent.
  if (!hasNationalScope) {
    if (storedMission) {
      delete payload.placesLeft;
    } else if (payload.placesTotal !== undefined && payload.placesTotal !== null) {
      payload.placesLeft = payload.placesTotal;
    } else {
      delete payload.placesLeft;
    }
  }

  // `tutorName` est toujours recalculé à partir du tuteur résolu.
  delete payload.tutorName;

  return null;
}
