// Filtre d'URL des contenus écrits par des tiers et rendus dans les fronts du support (articles de la
// base de connaissance, modules de texte, signatures). Un navigateur exécute `javascript:` dans un
// href au clic, et dans le src d'une iframe sans aucun clic : seule une liste blanche de schémas,
// vérifiée sur l'URL analysée, est sûre.
//
// Copie conforme du filtre de référence de snu-lib (packages/lib/src/utils/safeUrl.ts), dont
// snupport-api ne dépend pas. Toute modification se fait d'abord là-bas : les vecteurs partagés
// (packages/lib/src/utils/safeUrl.vectors.json) sont rejoués ici par __tests__/safeUrl.test.js (GOO-19).

const SAFE_LINK_PROTOCOLS = ["http:", "https:", "mailto:"];
const SAFE_IMAGE_PROTOCOLS = ["http:", "https:"];
const SAFE_VIDEO_HOSTS = ["player.vimeo.com"];

const parseAbsoluteUrl = (value, protocols) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    return null;
  }
  return protocols.includes(parsed.protocol) ? parsed : null;
};

const SITE_PATH = /^\/(?![/\\])/;

/** Vrai si la valeur est un chemin absolu du site courant (lien interne), sans `//` ni `/\`. */
const isSitePath = (value) => typeof value === "string" && SITE_PATH.test(value.trim());

/** URL de lien normalisée si elle est en http, https ou mailto (ou chemin interne avec `allowSitePath`), sinon null. */
const sanitizeLinkUrl = (value, { allowSitePath = false } = {}) => {
  if (allowSitePath && isSitePath(value)) return value.trim();
  return parseAbsoluteUrl(value, SAFE_LINK_PROTOCOLS)?.href ?? null;
};

/** URL d'image normalisée si elle est en http ou https, sinon null. */
const sanitizeImageUrl = (value) => parseAbsoluteUrl(value, SAFE_IMAGE_PROTOCOLS)?.href ?? null;

/** URL d'iframe vidéo : lecteur Vimeo en https uniquement, sinon null. */
const sanitizeVideoUrl = (value) => {
  const parsed = parseAbsoluteUrl(value, ["https:"]);
  if (!parsed || !SAFE_VIDEO_HOSTS.includes(parsed.hostname)) return null;
  return parsed.href;
};

/** URL https uniquement, sinon null. */
const sanitizeHttpsUrl = (value) => parseAbsoluteUrl(value, ["https:"])?.href ?? null;

module.exports = {
  SAFE_LINK_PROTOCOLS,
  SAFE_IMAGE_PROTOCOLS,
  SAFE_VIDEO_HOSTS,
  isSitePath,
  sanitizeLinkUrl,
  sanitizeImageUrl,
  sanitizeVideoUrl,
  sanitizeHttpsUrl,
};
