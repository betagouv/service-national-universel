/**
 * Champs répliqués par Monstache depuis Mongo vers Elasticsearch qui ne doivent
 * jamais quitter l'API : secrets d'authentification, jetons à usage unique et
 * compteurs d'anti-bruteforce.
 *
 * Source de vérité unique, utilisée à trois endroits :
 *  - exclusion `_source` dans les requêtes ES (défense principale) ;
 *  - filtrage des `exportFields` demandés par le client ;
 *  - sérialisation des réponses (dernier filet).
 *
 * L'objectif à terme est de ne plus répliquer ces champs du tout
 * (cf. devops/elastic-search-datariver).
 */

const ES_SENSITIVE_FIELDS_SHARED = [
  "password",
  "passwordChangedAt",
  "loginAttempts",
  "nextLoginAttemptIn",
  "token2FA",
  "token2FAExpires",
  "attempts2FA",
  "forgotPasswordResetToken",
  "forgotPasswordResetExpires",
  "invitationToken",
  "invitationExpires",
];

export const ES_YOUNG_SENSITIVE_FIELDS = [
  ...ES_SENSITIVE_FIELDS_SHARED,
  "tokenEmailValidation",
  "tokenEmailValidationExpires",
  "attemptsEmailValidation",
  "phase3Token",
  "parent1Inscription2023Token",
  "parent2Inscription2023Token",
  "parent1Inscription2023TokenExpiresAt",
  "parent2Inscription2023TokenExpiresAt",
];

export const ES_REFERENT_SENSITIVE_FIELDS = [...ES_SENSITIVE_FIELDS_SHARED];

/**
 * Indexé par nom d'index ES. Les index qui ne portent pas de secret sont absents :
 * `getEsSensitiveFields` renvoie alors une liste vide.
 */
export const ES_SENSITIVE_FIELDS_BY_INDEX: Record<string, string[]> = {
  young: ES_YOUNG_SENSITIVE_FIELDS,
  referent: ES_REFERENT_SENSITIVE_FIELDS,
};

export function getEsSensitiveFields(index?: string): string[] {
  if (!index) return [];
  return ES_SENSITIVE_FIELDS_BY_INDEX[index] || [];
}

/** Retire les champs secrets d'un document ES (mutation d'une copie). */
export function omitEsSensitiveFields<T extends Record<string, any>>(doc: T, index: string): T {
  const fields = getEsSensitiveFields(index);
  if (!fields.length || !doc || typeof doc !== "object") return doc;
  const out = { ...doc };
  for (const field of fields) delete out[field];
  return out;
}
