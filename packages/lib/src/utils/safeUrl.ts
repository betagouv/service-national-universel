// Filtre d'URL de référence pour tout contenu écrit par un tiers et rendu dans un front (liens, images,
// iframes, window.open). Un navigateur exécute `javascript:` dans un href au clic, et dans le src d'une
// iframe sans aucun clic : seule une liste blanche de schémas, vérifiée sur l'URL analysée, est sûre.
// Un test par préfixe (`startsWith("http")`) ou par expression régulière laisse passer les variantes
// (casse, espaces, caractères de contrôle, `//hôte`).
//
// Les vecteurs de test partagés (`safeUrl.vectors.json`) fixent le comportement attendu. snupport-app,
// snupport-api et knowledge-base-public, qui ne dépendent pas de snu-lib, gardent une copie de ce
// filtre et rejouent ces mêmes vecteurs (GOO-19).

/** Schémas acceptés dans un lien (`<a href>`, `window.open`). */
export const SAFE_LINK_PROTOCOLS = ["http:", "https:", "mailto:"] as const;
/** Schémas acceptés pour une image (`<img src>`). */
export const SAFE_IMAGE_PROTOCOLS = ["http:", "https:"] as const;
/** Hôtes acceptés dans une iframe vidéo : une iframe s'exécute sans clic. */
export const SAFE_VIDEO_HOSTS = ["player.vimeo.com"] as const;

type SafeUrlInput = string | null | undefined;

const parseAbsoluteUrl = (value: unknown, protocols: readonly string[]): URL | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return null;
  }
  return protocols.includes(parsed.protocol) ? parsed : null;
};

// Chemin absolu du site courant (`/base-de-connaissance/<slug>`), sans `//` ni `/\` qui feraient
// changer d'hôte.
const SITE_PATH = /^\/(?![/\\])/;

/** Vrai si la valeur est un chemin absolu du site courant (lien interne). */
export const isSitePath = (value: unknown): value is string => typeof value === "string" && SITE_PATH.test(value.trim());

/**
 * URL de lien normalisée si elle est en http, https ou mailto, sinon null. Avec `allowSitePath`, un
 * chemin interne (`/page`) est aussi accepté et renvoyé tel quel.
 */
export const sanitizeLinkUrl = (value: SafeUrlInput, { allowSitePath = false }: { allowSitePath?: boolean } = {}): string | null => {
  if (allowSitePath && isSitePath(value)) return value.trim();
  return parseAbsoluteUrl(value, SAFE_LINK_PROTOCOLS)?.href ?? null;
};

/** URL d'image normalisée si elle est en http ou https, sinon null. */
export const sanitizeImageUrl = (value: SafeUrlInput): string | null => parseAbsoluteUrl(value, SAFE_IMAGE_PROTOCOLS)?.href ?? null;

/** URL d'iframe vidéo : lecteur Vimeo en https uniquement, sinon null. */
export const sanitizeVideoUrl = (value: SafeUrlInput): string | null => {
  const parsed = parseAbsoluteUrl(value, ["https:"]);
  if (!parsed || !(SAFE_VIDEO_HOSTS as readonly string[]).includes(parsed.hostname)) return null;
  return parsed.href;
};

/** URL https uniquement (valeur saisie dans un formulaire et affichée comme lien), sinon null. */
export const sanitizeHttpsUrl = (value: SafeUrlInput): string | null => parseAbsoluteUrl(value, ["https:"])?.href ?? null;

export const isSafeLinkUrl = (value: SafeUrlInput, options?: { allowSitePath?: boolean }): boolean => sanitizeLinkUrl(value, options) !== null;
export const isSafeImageUrl = (value: SafeUrlInput): boolean => sanitizeImageUrl(value) !== null;
export const isSafeVideoUrl = (value: SafeUrlInput): boolean => sanitizeVideoUrl(value) !== null;
