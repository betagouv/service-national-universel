// Filtre d'URL des contenus écrits par des tiers (notes, modules de texte, signatures, brouillons,
// attributs de contact, articles). Un navigateur exécute `javascript:` dans un href, un src d'iframe
// ou un window.open : seule une liste blanche de schémas, vérifiée sur l'URL analysée, est sûre.
//
// Copie conforme du filtre de référence de snu-lib (packages/lib/src/utils/safeUrl.ts), dont
// snupport-app ne dépend pas. Toute modification se fait d'abord là-bas : les vecteurs partagés
// (packages/lib/src/utils/safeUrl.vectors.json) sont rejoués ici par __tests__/safeUrl.test.js (GOO-19).

export const SAFE_LINK_PROTOCOLS = ["http:", "https:", "mailto:"];
export const SAFE_IMAGE_PROTOCOLS = ["http:", "https:"];
export const SAFE_VIDEO_HOSTS = ["player.vimeo.com"];

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

/** Vrai si la valeur est un chemin absolu du site courant (lien interne). */
export const isSitePath = (value) => typeof value === "string" && SITE_PATH.test(value.trim());

/** URL de lien normalisée si elle est en http, https ou mailto (ou chemin interne avec `allowSitePath`), sinon null. */
export const sanitizeLinkUrl = (value, { allowSitePath = false } = {}) => {
  if (allowSitePath && isSitePath(value)) return value.trim();
  return parseAbsoluteUrl(value, SAFE_LINK_PROTOCOLS)?.href ?? null;
};

/** URL d'image normalisée si elle est en http ou https, sinon null. */
export const sanitizeImageUrl = (value) => parseAbsoluteUrl(value, SAFE_IMAGE_PROTOCOLS)?.href ?? null;

/** Une iframe s'exécute sans clic : seul le lecteur Vimeo, en https, est accepté. */
export const sanitizeVideoUrl = (value) => {
  const parsed = parseAbsoluteUrl(value, ["https:"]);
  if (!parsed || !SAFE_VIDEO_HOSTS.includes(parsed.hostname)) return null;
  return parsed.href;
};

/** Lien affiché à partir d'une valeur reçue d'un formulaire (attributs de contact) : https uniquement. */
export const sanitizeHttpsUrl = (value) => parseAbsoluteUrl(value, ["https:"])?.href ?? null;

// Origines des fronts SNU (production et staging) : un lien affiché à partir d'une valeur fournie par
// un tiers (attribut de contact du formulaire public anonyme) ne doit désigner que l'un de ces fronts,
// jamais un hôte quelconque présenté comme une métadonnée interne (PM32, hameçonnage). Copie conforme de
// `ALLOWED_REDIRECT_ORIGINS` (packages/lib/src/utils/request.ts, GOO-9), dont snupport-app ne dépend pas.
const SNU_FRONT_ORIGINS = [
  "https://snu.gouv.fr",
  "https://www.snu.gouv.fr",
  "https://admin.snu.gouv.fr",
  "https://moncompte.snu.gouv.fr",
  "https://support.snu.gouv.fr",
  "https://admin-support.snu.gouv.fr",
  "https://admin.beta-snu.dev",
  "https://moncompte.beta-snu.dev",
  "https://support.beta-snu.dev",
  "https://admin-support.beta-snu.dev",
];

/** Lien affiché à partir d'une valeur fournie par un tiers : https uniquement, vers un front SNU connu. */
export const sanitizeKnownHttpsUrl = (value) => {
  const parsed = parseAbsoluteUrl(value, ["https:"]);
  if (!parsed || !SNU_FRONT_ORIGINS.includes(parsed.origin)) return null;
  return parsed.href;
};
