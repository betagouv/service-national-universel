import { APPLICATION_STATUS, CohortType, ROLES, UserDto, YOUNG_STATUS, YoungType, canReferentUpdateApplicationStatus, canReferentUpdatePhase2Status } from "snu-lib";

/**
 * Règles d'écriture du dossier volontaire et des candidatures, appliquées côté API (GOO-12 : FM13, FL2).
 *
 * Elles n'existaient que dans l'admin (YoungHeader.jsx, selectStatus.jsx, selectStatusApplication.jsx,
 * SelectStatusApplicationPhase2.jsx) : un référent qui rejouait la requête posait n'importe quel statut,
 * changeait la cohorte ou l'affectation sans passer par les parcours dédiés. Les matrices ci-dessous
 * reprennent l'union de ce que proposent ces écrans, pour ne refuser aucune action que l'IHM permet.
 *
 * L'ADMIN n'est pas borné : il dispose déjà de toutes les transitions dans l'IHM.
 */

const GEO_ROLES: string[] = [ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION];

/** Transitions de statut d'inscription ouvertes aux rôles non ADMIN (hors désistement, traité à part). */
const YOUNG_STATUS_TRANSITIONS: Partial<Record<string, string[]>> = {
  [YOUNG_STATUS.WAITING_VALIDATION]: [YOUNG_STATUS.VALIDATED, YOUNG_STATUS.REFUSED, YOUNG_STATUS.WAITING_CORRECTION, YOUNG_STATUS.WAITING_LIST],
  [YOUNG_STATUS.WAITING_CORRECTION]: [YOUNG_STATUS.VALIDATED, YOUNG_STATUS.REFUSED, YOUNG_STATUS.WAITING_VALIDATION, YOUNG_STATUS.WAITING_LIST],
  [YOUNG_STATUS.WAITING_LIST]: [YOUNG_STATUS.VALIDATED],
};

/**
 * Champs qui ne se modifient pas par PUT /referent/young/:id hors ADMIN : la cohorte passe par
 * /change-cohort (éligibilité, places, notification), l'affectation par les routes d'affectation
 * (décompte des places, et une session d'un autre territoire étendrait le périmètre de lecture).
 */
const COHORT_AND_AFFECTATION_FIELDS = ["cohort", "cohortId", "originalCohort", "sessionPhase1Id", "cohesionCenterId", "meetingPointId"] as const;

function normalize(value: unknown): string {
  return value === undefined || value === null ? "" : String(value);
}

/** Le client renvoie souvent le dossier complet : seul un champ présent ET différent compte comme une modification. */
function isChanged(payload: Record<string, unknown>, young: Record<string, any>, field: string): boolean {
  return payload[field] !== undefined && normalize(payload[field]) !== normalize(young[field]);
}

export function canReferentChangeYoungStatus(user: Pick<UserDto, "role">, from: string | undefined, to: string): boolean {
  if (user.role === ROLES.ADMIN) return true;
  // Réactiver un volontaire désisté est réservé à l'ADMIN ; un dossier supprimé ne se modifie plus.
  if (from === YOUNG_STATUS.WITHDRAWN || from === YOUNG_STATUS.DELETED) return false;
  // Le désistement est ouvert depuis tout statut actif (YoungHeader, selectStatus, bouton Désister CLE).
  if (to === YOUNG_STATUS.WITHDRAWN) return true;
  return !!from && (YOUNG_STATUS_TRANSITIONS[from] || []).includes(to);
}

/**
 * Contrôle d'un PUT /referent/young/:id. Renvoie `true` si la modification demandée est autorisée
 * pour ce rôle.
 */
export function canReferentApplyYoungUpdate(
  user: Pick<UserDto, "role">,
  young: Pick<YoungType, "status" | "statusPhase1" | "statusPhase2" | "statusPhase3" | (typeof COHORT_AND_AFFECTATION_FIELDS)[number]>,
  payload: Record<string, unknown>,
  cohort?: CohortType | null,
): boolean {
  if (user.role === ROLES.ADMIN) return true;

  if (COHORT_AND_AFFECTATION_FIELDS.some((field) => isChanged(payload, young, field))) return false;

  if (isChanged(payload, young, "status") && !canReferentChangeYoungStatus(user, young.status, normalize(payload.status))) return false;

  // Le statut de phase 1 découle de la présence et de l'affectation : il est calculé par le serveur.
  if (isChanged(payload, young, "statusPhase1")) return false;

  // Phase 2 : référents territoriaux seulement, et pas sur une cohorte totalement archivée (selectStatus.jsx).
  if (isChanged(payload, young, "statusPhase2") && !(GEO_ROLES.includes(user.role) && !!cohort && canReferentUpdatePhase2Status(cohort))) return false;

  // Phase 3 : le sélecteur n'est utile qu'aux référents territoriaux.
  if (isChanged(payload, young, "statusPhase3") && !GEO_ROLES.includes(user.role)) return false;

  return true;
}

/** Transitions de candidature d'un responsable / superviseur de structure (union des deux sélecteurs de l'admin). */
const STRUCTURE_APPLICATION_TRANSITIONS: Partial<Record<string, string[]>> = {
  [APPLICATION_STATUS.WAITING_ACCEPTATION]: [APPLICATION_STATUS.REFUSED],
  [APPLICATION_STATUS.WAITING_VALIDATION]: [APPLICATION_STATUS.VALIDATED, APPLICATION_STATUS.REFUSED],
  [APPLICATION_STATUS.WAITING_VERIFICATION]: [APPLICATION_STATUS.VALIDATED, APPLICATION_STATUS.REFUSED],
  [APPLICATION_STATUS.VALIDATED]: [APPLICATION_STATUS.IN_PROGRESS, APPLICATION_STATUS.DONE, APPLICATION_STATUS.ABANDON, APPLICATION_STATUS.REFUSED],
  [APPLICATION_STATUS.IN_PROGRESS]: [APPLICATION_STATUS.DONE, APPLICATION_STATUS.ABANDON],
  [APPLICATION_STATUS.REFUSED]: [APPLICATION_STATUS.VALIDATED],
};

/**
 * Contrôle d'un changement de statut de candidature par un référent (au sens large : tout utilisateur
 * de l'admin). Le volontaire est borné à part, par `validateUpdateApplication`.
 *
 * Sans cette règle, un responsable passait une candidature WAITING_ACCEPTATION (non acceptée par le
 * volontaire) à DONE, ce qui validait sa phase 2 via `updateYoungPhase2StatusAndHours`.
 */
export function canReferentChangeApplicationStatus(user: Pick<UserDto, "role">, from: string | undefined, to: string, cohort?: CohortType | null): boolean {
  if (from === to) return true;
  if (user.role === ROLES.ADMIN) return true;
  if (GEO_ROLES.includes(user.role)) return !!cohort && canReferentUpdateApplicationStatus(cohort);
  if (user.role === ROLES.RESPONSIBLE || user.role === ROLES.SUPERVISOR) return !!from && (STRUCTURE_APPLICATION_TRANSITIONS[from] || []).includes(to);
  return false;
}
