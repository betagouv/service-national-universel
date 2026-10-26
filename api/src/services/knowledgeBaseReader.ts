/**
 * Rôles de la base de connaissance qu'un utilisateur peut lire (M86 de l'audit du 21/09/2026).
 *
 * snupport-api croyait le rôle que le lecteur lui annonçait dans l'URL : un anonyme lisait les
 * articles réservés aux admins en demandant `/knowledge-base/admin`. Le rôle se prouve désormais
 * par un jeton de lecture que snupport-api signe à la demande de l'API v1, pour les seuls rôles
 * calculés ici à partir du compte authentifié.
 *
 * La liste reprend ce que les interfaces demandaient déjà :
 * - `allowedRole` de `/signin/token` (rôle de lecture sur support.snu.gouv.fr) ;
 * - « Voir en tant que » de la base publique (knowledge-base-public, `AdminMenu.jsx`) ;
 * - le rôle de recherche du centre d'aide de l'admin (`admin/src/scenes/support-center/dashboard.jsx`),
 *   qui envoie `admin` pour les rôles nationaux (DSNJ, INJEP).
 */
import { ROLES, SUB_ROLES } from "snu-lib";

import SNUpport from "../SNUpport";
import { capture } from "../sentry";

export const KNOWLEDGE_BASE_PUBLIC_RESTRICTION = "public";

// Doit rester aligné sur KNOWLEDGE_BASE_ROLES de snupport-api (src/utils/knowledgeBaseReader.js).
export const KNOWLEDGE_BASE_RESTRICTIONS = [
  KNOWLEDGE_BASE_PUBLIC_RESTRICTION,
  "young",
  "young_cle",
  "structure",
  "referent",
  "referent_sanitaire",
  "head_center",
  "head_center_adjoint",
  "visitor",
  "transporter",
  "referent_classe",
  "admin",
  "administrateur_cle",
  "administrateur_cle_coordinateur_cle",
  "administrateur_cle_referent_etablissement",
  "responsible",
];

const REFERENT_SEE_AS = [
  "referent",
  "structure",
  "head_center",
  "head_center_adjoint",
  "referent_sanitaire",
  "young",
  "visitor",
  "young_cle",
  "administrateur_cle_coordinateur_cle",
  "administrateur_cle_referent_etablissement",
  "referent_classe",
];
const COORDINATEUR_CLE_SEE_AS = ["young_cle", "administrateur_cle_coordinateur_cle", "referent_classe", "head_center", "head_center_adjoint", "referent_sanitaire"];
const ADMINISTRATEUR_CLE_SEE_AS: Record<string, string[]> = {
  [SUB_ROLES.referent_etablissement]: ["young_cle", "administrateur_cle_coordinateur_cle", "administrateur_cle_referent_etablissement", "referent_classe"],
  [SUB_ROLES.coordinateur_cle]: COORDINATEUR_CLE_SEE_AS,
};

type KnowledgeBaseReader = { role?: string; subRole?: string; source?: string } | null | undefined;

/** Rôles de lecture reconnus au compte (toujours au moins `public`). */
export function knowledgeBaseReadableRoles(user: KnowledgeBaseReader, isYoungAccount: boolean): string[] {
  const roles = [KNOWLEDGE_BASE_PUBLIC_RESTRICTION];
  if (!user) return roles;

  if (isYoungAccount) {
    roles.push("young");
    if (user.source === "CLE") roles.push("young_cle");
    return roles;
  }

  switch (user.role) {
    case ROLES.ADMIN:
    case ROLES.DSNJ:
    case ROLES.INJEP:
      return [...KNOWLEDGE_BASE_RESTRICTIONS];
    case ROLES.REFERENT_DEPARTMENT:
    case ROLES.REFERENT_REGION:
      roles.push(...REFERENT_SEE_AS);
      break;
    case ROLES.RESPONSIBLE:
    case ROLES.SUPERVISOR:
      roles.push("structure");
      break;
    case ROLES.HEAD_CENTER:
      roles.push("head_center");
      break;
    case ROLES.HEAD_CENTER_ADJOINT:
      roles.push("head_center_adjoint", "head_center");
      break;
    case ROLES.REFERENT_SANITAIRE:
      roles.push("referent_sanitaire", "head_center");
      break;
    case ROLES.VISITOR:
      roles.push("visitor");
      break;
    case ROLES.TRANSPORTER:
      roles.push("transporter");
      break;
    case ROLES.ADMINISTRATEUR_CLE:
      roles.push("administrateur_cle", ...(ADMINISTRATEUR_CLE_SEE_AS[user.subRole || ""] || []));
      break;
    case ROLES.REFERENT_CLASSE:
      roles.push(...COORDINATEUR_CLE_SEE_AS);
      break;
  }
  return [...new Set(roles)];
}

/**
 * Demande à snupport-api un jeton de lecture pour ces rôles. `null` si seul `public` est lisible
 * (aucune preuve nécessaire) ou si snupport-api ne répond pas : le lecteur retombe alors sur la base publique.
 */
export async function requestKnowledgeBaseReaderToken(roles: string[]): Promise<string | null> {
  const restrictedRoles = roles.filter((role) => role !== KNOWLEDGE_BASE_PUBLIC_RESTRICTION);
  if (!restrictedRoles.length) return null;
  try {
    const response = await SNUpport.api("/v0/knowledge-base/reader-token", { method: "POST", body: JSON.stringify({ roles: restrictedRoles }) });
    return response?.ok && typeof response.data?.token === "string" ? response.data.token : null;
  } catch (error) {
    capture(error);
    return null;
  }
}
