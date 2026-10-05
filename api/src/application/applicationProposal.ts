import { APPLICATION_STATUS, ROLES } from "snu-lib";

/**
 * Proposition de mission : une candidature créée par un référent territorial ou un administrateur
 * (statut WAITING_ACCEPTATION), que le volontaire accepte en la passant en attente de validation.
 *
 * Tant que le volontaire ne l'a pas acceptée, la proposition n'ouvre rien à la structure : ni le dossier
 * du volontaire, ni sa candidature, ni aucun changement de statut. Le statut
 * seul ne suffit pas à la reconnaître : elle sort de WAITING_ACCEPTATION sans acceptation (annulation à
 * J+14, annulation de la mission, refus, décision du volontaire). Le marqueur `proposalNotAccepted` la
 * suit au-delà.
 */

const { WAITING_ACCEPTATION, WAITING_VALIDATION, WAITING_VERIFICATION, VALIDATED, IN_PROGRESS, DONE, REFUSED, CANCEL } = APPLICATION_STATUS;

/** Statuts qui font de la candidature un engagement réel : le marqueur est alors levé. */
const ENGAGED_STATUSES: string[] = [WAITING_VALIDATION, WAITING_VERIFICATION, VALIDATED, IN_PROGRESS, DONE];

/** Statuts de sortie d'une proposition qui n'a pas été acceptée. */
const EXIT_STATUSES: string[] = [REFUSED, CANCEL];

type ApplicationProposalState = { status?: string | null; proposalNotAccepted?: boolean | null };

/**
 * Filtre Mongo à ajouter au périmètre d'une structure : les candidatures qu'elle a le droit de voir.
 * Une proposition n'en fait pas partie tant que le volontaire ne l'a pas acceptée, qu'elle soit en
 * attente, refusée ou annulée.
 */
export const NOT_A_PROPOSAL = { status: { $ne: WAITING_ACCEPTATION }, proposalNotAccepted: { $ne: true } };

export function isUnacceptedProposal(application?: ApplicationProposalState | null): boolean {
  return !!application && (application.status === WAITING_ACCEPTATION || application.proposalNotAccepted === true);
}

/** Responsable ou superviseur : les rôles dont le périmètre est celui d'une structure. */
export function isStructureActor(user?: { role?: string } | null): boolean {
  return user?.role === ROLES.RESPONSIBLE || user?.role === ROLES.SUPERVISOR;
}

/**
 * Valeur du marqueur après un enregistrement qui crée la candidature ou change son statut, ou
 * `undefined` s'il n'y a rien à écrire.
 *
 * `previousStatus` n'est utile que pour une sortie en REFUSED ou CANCEL : une proposition
 * antérieure au marqueur n'en porte pas encore.
 */
export function nextProposalMarker({ status, previousStatus, current }: { status?: string | null; previousStatus?: string | null; current?: boolean | null }): boolean | undefined {
  if (status === WAITING_ACCEPTATION) return true;
  if (status && ENGAGED_STATUSES.includes(status)) return current ? false : undefined;
  if (status && EXIT_STATUSES.includes(status) && previousStatus === WAITING_ACCEPTATION) return true;
  return undefined;
}

/** Une sortie vers REFUSED ou CANCEL d'une candidature non marquée oblige à connaître son statut d'avant. */
export function needsPreviousStatus({ status, current }: { status?: string | null; current?: boolean | null }): boolean {
  return !!status && EXIT_STATUSES.includes(status) && current !== true;
}
