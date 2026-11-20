/**
 * Règles du contrôle GOO-40 / GOO-5 : quels changements d'un compte référent, tracés dans
 * `referent_patches`, auraient été refusés par `isReferentUpdateInUserScope` (#5360) ?
 *
 * Module pur (aucun accès base) pour être testé sans Mongo ; le parcours de la collection est dans
 * `auditReferentSelfUpdates.effect.ts`.
 *
 * Les patches ne portent que le résultat d'une écriture, pas la requête : on juge chaque opération
 * sur l'auteur (`user`, figé par `buildPatchUser`) et la valeur écrite. Les règles reprennent celles
 * de #5360, plus le rôle, que `canUpdateReferent` bornait déjà mais qu'une prise de compte viserait.
 */
import { ROLES, region2department } from "snu-lib";

/** Merge de #5360 (23/09/2026, 12 h 33 UTC) : après cette date, l'API refuse ces écritures. */
export const GOO5_FIX_MERGED_AT = new Date("2026-09-23T12:33:00Z");

export type PatchOp = { op: string; path: string; value?: unknown; originalValue?: unknown };
export type PatchActor = {
  _id?: unknown;
  role?: string;
  region?: string;
  department?: string | string[];
  email?: string;
  impersonatedBy?: PatchActor;
};
export type ReferentPatch = { _id: unknown; ref: unknown; date?: Date; ops?: PatchOp[]; user?: PatchActor };

// « COURRIEL » et non « EMAIL » : la redaction du logger masque tout ce qui ressemble à `email=…`.
export type FindingReason =
  | "AUTO_STATUT"
  | "AUTO_COURRIEL"
  | "AUTO_ROLE"
  | "AUTO_SOUS_ROLE"
  | "AUTO_GEOGRAPHIE_HORS_TERRITOIRE"
  | "TIERS_STATUT"
  | "TIERS_COURRIEL"
  | "TIERS_ROLE"
  | "TIERS_GEOGRAPHIE_HORS_TERRITOIRE";

export type Finding = { path: string; reason: FindingReason; value?: unknown; originalValue?: unknown };

export type Classification =
  | { kind: "ignore"; why: "hors_champs_surveilles" | "admin" | "sans_auteur" | "dans_le_perimetre" }
  | { kind: "suspect"; self: boolean; findings: Finding[] };

const WATCHED_FIELDS = ["status", "email", "role", "subRole", "region", "department"] as const;
type WatchedField = (typeof WATCHED_FIELDS)[number];

/** `/department/1` → `department` ; renvoie `null` pour un champ non surveillé. */
export function watchedField(path: string): WatchedField | null {
  const field = path.split("/")[1];
  return (WATCHED_FIELDS as readonly string[]).includes(field) ? (field as WatchedField) : null;
}

function toList(value: unknown): string[] {
  if (value === undefined || value === null || value === "") return [];
  return (Array.isArray(value) ? value : [value]).filter((v): v is string => typeof v === "string" && v !== "");
}

function sameEmail(a: unknown, b: unknown): boolean {
  return (
    String(a ?? "")
      .toLowerCase()
      .trim() ===
    String(b ?? "")
      .toLowerCase()
      .trim()
  );
}

/** Territoire d'un acteur, tel que `isReferentUpdateInUserScope` le calcule. */
function actorTerritory(actor: PatchActor): { region?: string; departments: string[] } | null {
  if (actor.role === ROLES.REFERENT_REGION) return { region: actor.region, departments: (actor.region && region2department[actor.region]) || [] };
  if (actor.role === ROLES.REFERENT_DEPARTMENT) return { region: actor.region, departments: toList(actor.department) };
  return null; // Responsable, superviseur, rôles CLE… : pas de territoire, aucune géographie modifiable.
}

function isOutsideTerritory(field: "region" | "department", op: PatchOp, actor: PatchActor): boolean {
  if (op.op === "remove") return false; // Retirer un département ne l'étend pas.
  const territory = actorTerritory(actor);
  if (!territory) return true;
  const written = toList(op.value);
  if (field === "region") return written.some((region) => region !== territory.region);
  return written.some((department) => !territory.departments.includes(department));
}

/** Juge une opération ; `null` si #5360 l'aurait laissée passer. */
function judgeOp(op: PatchOp, actor: PatchActor, self: boolean): Finding | null {
  const field = watchedField(op.path);
  if (!field) return null;
  const prefix = self ? "AUTO" : "TIERS";
  const finding = (reason: FindingReason): Finding => ({ path: op.path, reason, value: op.value, originalValue: op.originalValue });

  switch (field) {
    case "status":
      return finding(`${prefix}_STATUT`);
    case "email":
      return sameEmail(op.value, op.originalValue) ? null : finding(`${prefix}_COURRIEL`);
    case "role":
      return finding(`${prefix}_ROLE`);
    case "subRole":
      // Un tiers de même territoire peut changer le sous-rôle ; soi-même, non.
      return self ? finding("AUTO_SOUS_ROLE") : null;
    case "region":
    case "department":
      return isOutsideTerritory(field, op, actor) ? finding(`${prefix}_GEOGRAPHIE_HORS_TERRITOIRE`) : null;
  }
}

export function classifyReferentPatch(patch: ReferentPatch): Classification {
  const ops = (patch.ops || []).filter((op) => watchedField(op.path));
  if (!ops.length) return { kind: "ignore", why: "hors_champs_surveilles" };

  const actor = patch.user;
  // Crons, inscription, invitation : l'écriture n'a pas d'auteur connecté, #5360 ne la concernait pas.
  if (!actor?._id) return { kind: "ignore", why: "sans_auteur" };
  // Une usurpation d'identité est faite par un admin : c'est lui l'auteur réel.
  if (actor.role === ROLES.ADMIN || actor.impersonatedBy?.role === ROLES.ADMIN) return { kind: "ignore", why: "admin" };

  const self = String(actor._id) === String(patch.ref);
  const findings = ops.map((op) => judgeOp(op, actor, self)).filter((f): f is Finding => f !== null);
  if (!findings.length) return { kind: "ignore", why: "dans_le_perimetre" };
  return { kind: "suspect", self, findings };
}
