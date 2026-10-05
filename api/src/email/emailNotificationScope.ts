/**
 * Périmètre de lecture des notifications mail (audit API 2026-09-21, constats C12 / M18 / M15).
 *
 * Les trois routes de notifications (`GET /email`, `GET /email/:id`,
 * `POST /elasticsearch/email/:email/:action`) ne sont protégées que par la permission
 * `USER_NOTIFICATIONS_READ`. Cette permission est seedée SANS `policy`
 * (api/migrations/20250624122150-seed-responsable-permissions.js L225-230, + SUPERVISOR par
 * 20250801060707) : `hasUnrestrictedPermission` renvoie donc true et `isAuthorized` autorise
 * l'appel quel que soit le destinataire visé. N'importe quel référent porteur de la permission
 * pouvait lire l'historique — et le contenu — des mails de n'importe qui, y compris d'un ADMIN.
 *
 * Ce module rétablit le lien manquant entre l'adresse visée et le périmètre de l'appelant.
 * Les règles reprennent celles déjà appliquées aux fiches et annuaires correspondants :
 *   - référents : `isReferentReadableByUser` (api/src/referent/referentScope.ts), la règle de
 *     lecture d'une fiche. Une table de rôles « visibles sans condition géographique » laissait
 *     un référent départemental ou régional lire les mails des responsables de tout le pays (PM25).
 *   - jeunes    : `buildYoungContext` (api/src/controllers/elasticsearch/young.ts)
 * Une adresse ne peut donc pas donner accès à plus que la fiche de la personne elle-même.
 * Point clé : aucun de ces périmètres ne contient le rôle ADMIN, ce qui coupe la chaîne
 * « forgot_password sur un ADMIN → lecture du mail → prise de contrôle ».
 *
 * Fail-closed : une adresse qui ne correspond à aucun jeune ni référent connu est refusée
 * (sinon la route resterait un oracle d'existence de compte).
 */
import { ROLES, ReferentType, UserDto } from "snu-lib";

import { ApplicationModel, ClasseModel, EtablissementModel, ReferentModel, SessionPhase1Model, StructureModel, YoungModel } from "../models";
import { isReferentReadableByUser } from "../referent/referentScope";

const norm = (email: string) => email.trim().toLowerCase();

/** `UserDto.department` est typé `string | string[]` selon les comptes : on normalise. */
const toDepartments = (value?: string | string[] | null): string[] => (Array.isArray(value) ? value : value ? [value] : []);

function shareDepartment(userDepartments: string[] = [], departments: (string | undefined | null)[] = []): boolean {
  const target = departments.filter(Boolean) as string[];
  return userDepartments.filter(Boolean).some((department) => target.includes(department));
}

/** Établissements dont l'appelant est chef d'établissement ou coordinateur. */
async function getEtablissementIds(user: UserDto): Promise<string[]> {
  const etablissements = await EtablissementModel.find({ $or: [{ coordinateurIds: user._id }, { referentEtablissementIds: user._id }] }, { _id: 1 }).lean();
  return etablissements.map((etablissement) => etablissement._id.toString());
}

/** Structures de l'appelant : la sienne et, pour un superviseur, celles de son réseau. */
async function getStructureIds(user: UserDto): Promise<string[]> {
  if (!user.structureId) return [];
  const structures = await StructureModel.find({ $or: [{ _id: String(user.structureId) }, { networkId: String(user.structureId) }] }, { _id: 1 }).lean();
  const ids = structures.map((structure) => structure._id.toString());
  return ids.length ? ids : [String(user.structureId)];
}

async function isReferentInScope(user: UserDto, target: ReferentType) {
  // Un ADMIN n'est dans le périmètre de personne d'autre qu'un ADMIN : un compte admin peut porter une
  // région ou un département, la règle géographique de la fiche ne suffit donc pas à l'exclure.
  if (!target.role || target.role === ROLES.ADMIN) return false;
  return isReferentReadableByUser(user, target);
}

async function isYoungInScope(
  user: UserDto,
  young: {
    _id: any;
    region?: string | null;
    schoolRegion?: string | null;
    department?: string | null;
    schoolDepartment?: string | null;
    etablissementId?: string | null;
    classeId?: string | null;
    sessionPhase1Id?: string | null;
  },
) {
  if (user.role === ROLES.REFERENT_REGION) {
    if (!!user.region && [young.region, young.schoolRegion].includes(user.region)) return true;
    // Jeune affecté dans un centre de la région (cf. `buildYoungContext`, showAffectedToRegionOrDep).
    if (!young.sessionPhase1Id) return false;
    return !!(await SessionPhase1Model.exists({ _id: young.sessionPhase1Id, region: user.region }));
  }

  if (user.role === ROLES.REFERENT_DEPARTMENT) {
    if (shareDepartment(toDepartments(user.department), [young.department, young.schoolDepartment])) return true;
    if (!young.sessionPhase1Id) return false;
    return !!(await SessionPhase1Model.exists({ _id: young.sessionPhase1Id, department: { $in: toDepartments(user.department) } }));
  }

  if (user.role === ROLES.ADMINISTRATEUR_CLE) {
    const etablissementIds = await getEtablissementIds(user);
    return !!young.etablissementId && etablissementIds.includes(String(young.etablissementId));
  }

  if (user.role === ROLES.REFERENT_CLASSE) {
    if (!young.classeId) return false;
    return !!(await ClasseModel.exists({ _id: young.classeId, referentClasseIds: user._id }));
  }

  if ([ROLES.SUPERVISOR, ROLES.RESPONSIBLE].includes(user.role)) {
    const structureIds = await getStructureIds(user);
    if (!structureIds.length) return false;
    return !!(await ApplicationModel.exists({ youngId: young._id.toString(), structureId: { $in: structureIds } }));
  }

  return false;
}

/**
 * L'appelant a-t-il le droit de consulter les notifications envoyées à cette adresse ?
 * Une adresse inconnue (aucun jeune, aucun référent) est refusée.
 */
export async function isEmailInUserScope(user: UserDto, email: string): Promise<boolean> {
  if (!user?.role || !email) return false;
  if (user.role === ROLES.ADMIN) return true;

  const target = norm(email);
  if (user.email && norm(user.email) === target) return true;

  // Projection élargie aux champs dont `getReferentGeography` déduit le territoire d'un compte sans
  // région ni département (centre de cohésion, session).
  const referents = await ReferentModel.find({ email: target }, { role: 1, region: 1, department: 1, structureId: 1, cohesionCenterId: 1, sessionPhase1Id: 1 }).lean();
  for (const referent of referents) {
    if (await isReferentInScope(user, referent as ReferentType)) return true;
  }

  const youngs = await YoungModel.find(
    { $or: [{ email: target }, { parent1Email: target }, { parent2Email: target }] },
    { region: 1, schoolRegion: 1, department: 1, schoolDepartment: 1, etablissementId: 1, classeId: 1, sessionPhase1Id: 1 },
  ).lean();
  for (const young of youngs) {
    if (await isYoungInScope(user, young)) return true;
  }

  return false;
}
