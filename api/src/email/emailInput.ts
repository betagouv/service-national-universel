/**
 * Contrôle des contenus fournis par l'appelant et recopiés dans les emails transactionnels
 * (constats M74 et M67).
 *
 * `POST /young/:id/email/:template` et `POST /referent/:tutorId/email/:template` reprenaient tels
 * quels le lien, le bouton d'action et le message reçus dans la requête : n'importe quel référent
 * (et n'importe quel volontaire pour son propre compte) pouvait faire partir, depuis l'expéditeur
 * officiel du SNU, un message balisé pointant vers le domaine de son choix.
 *
 * Les seules URL légitimes sont celles du service lui-même : les deux fronts, la base de
 * connaissance et le stockage objet d'où sont servis les documents (cf. `CDN_BASE_URL`,
 * app/src/scenes/representants-legaux/commons.js). Tout le reste est refusé.
 */
import { config } from "../config";
import { sanitizeAll } from "../utils";

/** Hôte du stockage objet Clever Cloud, écrit en dur côté front comme côté infra. */
const CELLAR_HOST = "https://cellar-c2.services.clever-cloud.com";

function toOrigin(value?: string | null): string | null {
  if (!value) return null;
  try {
    // `CELLAR_ENDPOINT` est configuré sous forme d'endpoint S3, parfois sans schéma.
    return new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`).origin.toLowerCase();
  } catch {
    return null;
  }
}

function getTrustedOrigins(): string[] {
  return [config.APP_URL, config.ADMIN_URL, config.KNOWLEDGEBASE_URL, config.CELLAR_ENDPOINT, CELLAR_HOST].map(toOrigin).filter((origin): origin is string => !!origin);
}

/**
 * Une URL absolue http(s) sur un domaine du service. Une valeur vide est acceptée : l'appelant
 * n'a alors rien fourni et le serveur applique son lien par défaut.
 */
export function isTrustedEmailLink(value?: string | null): boolean {
  if (!value) return true;
  if (!/^https?:\/\//i.test(value)) return false;
  const origin = toOrigin(value);
  return !!origin && getTrustedOrigins().includes(origin);
}

/**
 * Retire le balisage d'un texte libre destiné au corps d'un mail, sans transformer une valeur
 * absente en chaîne vide (les gabarits Brevo distinguent les deux).
 */
export function sanitizeEmailText<T extends string | null | undefined>(value: T): T {
  return (value === undefined || value === null || value === "" ? value : sanitizeAll(value)) as T;
}
