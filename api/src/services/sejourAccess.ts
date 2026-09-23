import { ROLES, UserDto } from "snu-lib";

import { CohesionCenterModel } from "../models";

/**
 * Périmètre des séjours de cohésion et du plan de transport.
 *
 * Ces fonctionnalités sont retirées du produit : seules subsistent la consultation
 * des données historiques par un administrateur et par les référents territoriaux,
 * dans leur département / région. Les gardes d'origine (`canShareSessionPhase1`,
 * `canViewMeetingPoints`, `canDownloadYoungDocuments`, `LIGNE_BUS:READ` posé avec
 * `ignorePolicy: true`) ne testaient que le rôle, jamais l'appartenance : un
 * responsable de structure ou un chef de centre quelconque atteignait n'importe
 * quelle session et n'importe quelle ligne de bus de France.
 *
 * Tout rôle non listé ici est refusé (fail-closed).
 */

type GeoScope = {
  department?: string | null;
  region?: string | null;
};

function isInGeoScope(user: UserDto, { department, region }: GeoScope): boolean {
  switch (user?.role) {
    case ROLES.ADMIN:
      return true;

    case ROLES.REFERENT_DEPARTMENT:
      if (!department) return false;
      return (user.department || []).includes(department);

    case ROLES.REFERENT_REGION:
      if (!region || !user.region) return false;
      return String(region) === String(user.region);

    default:
      // fail-closed : chefs de centre, responsables, superviseurs, transporteurs,
      // rôles CLE… n'ont plus aucun accès à ces données.
      return false;
  }
}

/** Rôles autorisés à consulter l'historique des séjours et du plan de transport. */
export function canViewSejourHistory(user: UserDto): boolean {
  return [ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(user?.role as any);
}

/**
 * Les accompagnateurs (`team`) sont des tiers : état civil, date de naissance,
 * email et téléphone personnels. Seul un administrateur y accède encore.
 */
export function canViewConvoyeurTeam(user: UserDto): boolean {
  return user?.role === ROLES.ADMIN;
}

/** Retire le champ `team` d'une ligne de bus pour les rôles qui n'y ont pas droit. */
export function serializeLigneBus<T extends { toObject?: () => any; _doc?: any }>(ligneBus: T, user: UserDto): any {
  if (!ligneBus) return ligneBus;
  const plain = typeof ligneBus.toObject === "function" ? ligneBus.toObject() : { ...(ligneBus._doc ?? ligneBus) };
  if (canViewConvoyeurTeam(user)) return plain;
  const { team, ...rest } = plain;
  return rest;
}

export function serializeLigneBusList(lignes: any[], user: UserDto): any[] {
  return (lignes || []).map((ligne) => serializeLigneBus(ligne, user));
}

export function isSessionPhase1InUserScope(user: UserDto, session: GeoScope): boolean {
  return isInGeoScope(user, { department: session?.department, region: session?.region });
}

/** Filtre Mongo des sessions du périmètre de l'utilisateur ; `null` = aucun accès. */
export function getSessionPhase1ScopeFilter(user: UserDto): Record<string, unknown> | null {
  return getGeoScopeFilter(user);
}

/** Filtre Mongo des centres de cohésion du périmètre de l'utilisateur ; `null` = aucun accès. */
export function getCohesionCenterScopeFilter(user: UserDto): Record<string, unknown> | null {
  return getGeoScopeFilter(user);
}

/** Variante synchrone de `isCohesionCenterInUserScope`, pour un centre déjà chargé. */
export function isCohesionCenterDocInUserScope(user: UserDto, center: GeoScope): boolean {
  return isInGeoScope(user, { department: center?.department, region: center?.region });
}

function getGeoScopeFilter(user: UserDto): Record<string, unknown> | null {
  switch (user?.role) {
    case ROLES.ADMIN:
      return {};
    case ROLES.REFERENT_DEPARTMENT:
      return { department: { $in: user.department || [] } };
    case ROLES.REFERENT_REGION:
      return user.region ? { region: user.region } : null;
    default:
      return null;
  }
}

export function isPointDeRassemblementInUserScope(user: UserDto, pdr: GeoScope): boolean {
  return isInGeoScope(user, { department: pdr?.department, region: pdr?.region });
}

/** Le centre de cohésion porte le département / la région de rattachement du séjour. */
export async function isCohesionCenterInUserScope(user: UserDto, centerId?: string | null): Promise<boolean> {
  if (user?.role === ROLES.ADMIN) return true;
  if (!centerId) return false;
  const center = await CohesionCenterModel.findById(String(centerId)).select({ department: 1, region: 1 });
  if (!center) return false;
  return isCohesionCenterDocInUserScope(user, center);
}

/** Une ligne de bus est rattachée au périmètre de son centre de destination. */
export async function isLigneBusInUserScope(user: UserDto, ligneBus?: { centerId?: string | null } | null): Promise<boolean> {
  if (user?.role === ROLES.ADMIN) return true;
  if (!ligneBus?.centerId) return false;
  return isCohesionCenterInUserScope(user, ligneBus.centerId);
}

/**
 * Écriture sur une ligne de bus (équipe, points de rassemblement, demandes de modification).
 * Le transporteur est un acteur national : il garde l'accès à toutes les lignes, sous
 * réserve des fenêtres d'édition vérifiées par chaque route. Les référents restent
 * dans leur périmètre ; tout autre rôle est refusé.
 */
export async function canActOnLigneBus(user: UserDto, ligneBus?: { centerId?: string | null } | null): Promise<boolean> {
  if (!ligneBus) return false;
  if (user?.role === ROLES.TRANSPORTER) return true;
  return isLigneBusInUserScope(user, ligneBus);
}

/** Identifiants des centres du périmètre de l'utilisateur, pour filtrer une liste. */
export async function getCenterIdsInUserScope(user: UserDto): Promise<string[] | null> {
  if (user?.role === ROLES.ADMIN) return null; // null = pas de filtre
  const filter =
    user?.role === ROLES.REFERENT_DEPARTMENT
      ? { department: { $in: user.department || [] } }
      : user?.role === ROLES.REFERENT_REGION
        ? { region: user.region }
        : null;
  if (!filter) return [];
  const centers = await CohesionCenterModel.find(filter).select({ _id: 1 });
  return centers.map((center) => String(center._id));
}
