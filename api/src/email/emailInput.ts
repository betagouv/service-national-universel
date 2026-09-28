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
 * connaissance et les buckets d'où sont servis les documents (cf. `CDN_BASE_URL` côté app et
 * admin). Tout le reste est refusé.
 *
 * Le stockage objet Clever Cloud est mutualisé entre tous ses clients et adressé par chemin
 * (`https://cellar-c2.services.clever-cloud.com/<bucket>/...`) : son origine seule ne prouve rien,
 * n'importe qui peut y publier une page (constats PM24 et PM37). On y exige donc le préfixe d'un
 * bucket du SNU.
 */
import { config } from "../config";
import { sanitizeAll } from "../utils";

/** Buckets publics du SNU, écrits en dur côté fronts (`CDN_BASE_URL`). */
const TRUSTED_STORAGE_PREFIXES = ["https://cellar-c2.services.clever-cloud.com/cni-bucket-prod/", "https://cellar-c2.services.clever-cloud.com/cni-bucket-staging/"];

function toUrl(value: string): URL | null {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function getTrustedOrigins(): string[] {
  return [config.APP_URL, config.ADMIN_URL, config.KNOWLEDGEBASE_URL]
    .map((value) => (value ? toUrl(value)?.origin.toLowerCase() : null))
    .filter((origin): origin is string => !!origin);
}

/**
 * Une URL absolue http(s) sur un domaine du service, ou dans un bucket du SNU. Une valeur vide est
 * acceptée : l'appelant n'a alors rien fourni et le serveur applique son lien par défaut.
 */
export function isTrustedEmailLink(value?: string | null): boolean {
  if (!value) return true;
  if (!/^https?:\/\//i.test(value)) return false;
  const url = toUrl(value);
  if (!url) return false;
  if (getTrustedOrigins().includes(url.origin.toLowerCase())) return true;
  // `URL` a déjà résolu les segments `..` (y compris encodés) : le chemin comparé est le chemin servi.
  const target = `${url.origin.toLowerCase()}${url.pathname}`;
  return TRUSTED_STORAGE_PREFIXES.some((prefix) => target.startsWith(prefix));
}

/**
 * Retire le balisage d'un texte libre destiné au corps d'un mail, sans transformer une valeur
 * absente en chaîne vide (les gabarits Brevo distinguent les deux).
 */
export function sanitizeEmailText<T extends string | null | undefined>(value: T): T {
  return (value === undefined || value === null || value === "" ? value : sanitizeAll(value)) as T;
}
