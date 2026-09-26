/**
 * Verrouillage temporaire de l'accès référent (admin, apiv2, support).
 *
 * Porté par le feature flag `ADMIN_ACCESS_RESTRICTED` : tant qu'il est actif (`enabled`, ou dans sa
 * fenêtre `date`), seuls les référents dont l'identifiant figure dans `allowedReferentIds` gardent
 * une session. Flag absent ou inactif : aucune restriction.
 *
 * Pendant une impersonation, c'est l'administrateur réel qui est contrôlé, pas le compte ciblé :
 * un administrateur autorisé doit pouvoir consulter le compte d'un référent qui ne l'est pas.
 *
 * La règle est partagée par api (passport, connexion) et apiv2 (middleware de session) pour que
 * les deux API tranchent à l'identique.
 */

export type AdminAccessRestrictionFlag = {
  enabled?: boolean | null;
  date?: { from?: Date | string | null; to?: Date | string | null } | null;
  allowedReferentIds?: string[] | null;
};

export type AdminAccessSubject = {
  referentId: string;
  impersonatorId?: string | null;
};

export const isAdminAccessRestrictionActive = (flag: AdminAccessRestrictionFlag | null | undefined, now: Date = new Date()): boolean => {
  if (!flag) return false;
  if (flag.enabled) return true;
  const from = flag.date?.from ? new Date(flag.date.from) : null;
  const to = flag.date?.to ? new Date(flag.date.to) : null;
  return !!from && !!to && from <= now && now <= to;
};

export const isAdminAccessAllowed = (flag: AdminAccessRestrictionFlag | null | undefined, subject: AdminAccessSubject, now: Date = new Date()): boolean => {
  if (!isAdminAccessRestrictionActive(flag, now)) return true;
  const controlledId = subject.impersonatorId || subject.referentId;
  if (!controlledId) return false;
  return (flag?.allowedReferentIds || []).some((id) => String(id) === String(controlledId));
};
