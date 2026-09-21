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
 * Les règles reprennent celles déjà appliquées aux annuaires correspondants :
 *   - référents : `buildReferentContext` (api/src/controllers/elasticsearch/referent.ts)
 *   - jeunes    : `buildYoungContext` (api/src/controllers/elasticsearch/young.ts)
 * Une adresse ne peut donc pas donner accès à plus que la fiche de la personne elle-même.
 * Point clé : aucun de ces périmètres ne contient le rôle ADMIN, ce qui coupe la chaîne
 * « forgot_password sur un ADMIN → lecture du mail → prise de contrôle ».
 *
 * Fail-closed : une adresse qui ne correspond à aucun jeune ni référent connu est refusée
 * (sinon la route resterait un oracle d'existence de compte).
 */
import { ROLES, UserDto } from "snu-lib";

import { ApplicationModel, ClasseModel, EtablissementModel, ReferentModel, SessionPhase1Model, StructureModel, YoungModel } from "../models";

const norm = (email: string) => email.trim().toLowerCase();

/** `UserDto.department` est typé `string | string[]` selon les comptes : on normalise. */
const toDepartments = (value?: string | string[] | null): string[] => (Array.isArray(value) ? value : value ? [value] : []);

/** Rôles que l'appelant peut voir sans condition géographique, à l'image de `buildReferentContext`. */
const REFERENT_ROLES_VISIBLE_BY: Partial<Record<string, string[]>> = {
  [ROLES.REFERENT_REGION]: [
    ROLES.REFERENT_REGION,
    ROLES.SUPERVISOR,
    ROLES.RESPONSIBLE,
    ROLES.HEAD_CENTER,
    ROLES.HEAD_CENTER_ADJOINT,
    ROLES.REFERENT_SANITAIRE,
    ROLES.ADMINISTRATEUR_CLE,
    ROLES.REFERENT_CLASSE,
  ],
  [ROLES.REFERENT_DEPARTMENT]: [
    ROLES.REFERENT_DEPARTMENT,
    ROLES.REFERENT_REGION,
    ROLES.SUPERVISOR,
    ROLES.RESPONSIBLE,
    ROLES.HEAD_CENTER,
    ROLES.HEAD_CENTER_ADJOINT,
    ROLES.REFERENT_SANITAIRE,
    ROLES.ADMINISTRATEUR_CLE,
    ROLES.REFERENT_CLASSE,
  ],
};

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

async function isReferentInScope(user: UserDto, target: { _id: any; role?: string | null; region?: string | null; department?: string[] | null; structureId?: string | null }) {
  // Un ADMIN n'est dans le périmètre de personne d'autre qu'un ADMIN (cf. `buildReferentContext`).
  if (!target.role || target.role === ROLES.ADMIN) return false;

  const visibleRoles = REFERENT_ROLES_VISIBLE_BY[user.role];
  if (visibleRoles) {
    if (visibleRoles.includes(target.role)) return true;
    // Pour un référent régional, les référents départementaux et les visiteurs sont limités à sa région.
    if (user.role === ROLES.REFERENT_REGION && [ROLES.REFERENT_DEPARTMENT, ROLES.VISITOR].includes(target.role)) {
      return !!user.region && target.region === user.region;
    }
    return false;
  }

  if ([ROLES.ADMINISTRATEUR_CLE, ROLES.REFERENT_CLASSE].includes(user.role)) {
    const etablissementIds = user.role === ROLES.ADMINISTRATEUR_CLE ? await getEtablissementIds(user) : [];
    if (user.role === ROLES.REFERENT_CLASSE) {
      const classes = await ClasseModel.find({ referentClasseIds: user._id }, { etablissementId: 1 }).lean();
      etablissementIds.push(...classes.map((classe) => classe.etablissementId).filter(Boolean));
    }
    if (!etablissementIds.length) return false;

    const etablissements = await EtablissementModel.find({ _id: { $in: etablissementIds } }, { department: 1, referentEtablissementIds: 1, coordinateurIds: 1 }).lean();
    const classes = await ClasseModel.find({ etablissementId: { $in: etablissementIds } }, { referentClasseIds: 1 }).lean();

    const referentIds = new Set<string>([
      ...etablissements.flatMap((etablissement) => [...(etablissement.referentEtablissementIds || []), ...(etablissement.coordinateurIds || [])]),
      ...classes.flatMap((classe) => classe.referentClasseIds || []),
    ]);
    if (referentIds.has(target._id.toString())) return true;

    // Les référents départementaux du département de l'établissement restent joignables.
    const departments = etablissements.map((etablissement) => etablissement.department);
    return target.role === ROLES.REFERENT_DEPARTMENT && shareDepartment(target.department || [], departments);
  }

  if ([ROLES.SUPERVISOR, ROLES.RESPONSIBLE].includes(user.role)) {
    if (![ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(target.role)) return false;
    const structureIds = await getStructureIds(user);
    return !!target.structureId && structureIds.includes(String(target.structureId));
  }

  return false;
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

  const referents = await ReferentModel.find({ email: target }, { role: 1, region: 1, department: 1, structureId: 1 }).lean();
  for (const referent of referents) {
    if (await isReferentInScope(user, referent)) return true;
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
