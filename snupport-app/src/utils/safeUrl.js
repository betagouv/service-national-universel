// Filtre d'URL des contenus écrits par des tiers (notes, modules de texte, signatures, brouillons,
// attributs de contact). Un navigateur exécute `javascript:` dans un href, un src d'iframe ou un
// window.open : seule une liste blanche de schémas, vérifiée sur l'URL analysée, est sûre.
// À remplacer par le filtre partagé de snu-lib dès qu'il existe (GOO-19).

const LINK_PROTOCOLS = ["http:", "https:", "mailto:"];
const IMAGE_PROTOCOLS = ["http:", "https:"];
const VIDEO_HOSTS = ["player.vimeo.com"];

const parseUrl = (value, protocols) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    return null;
  }
  if (!protocols.includes(parsed.protocol)) return null;
  return parsed;
};

/** Renvoie l'URL normalisée si elle est en http, https ou mailto, sinon null. */
export const sanitizeLinkUrl = (value) => parseUrl(value, LINK_PROTOCOLS)?.href ?? null;

/** Renvoie l'URL normalisée si elle est en http ou https, sinon null. */
export const sanitizeImageUrl = (value) => parseUrl(value, IMAGE_PROTOCOLS)?.href ?? null;

/** Une iframe s'exécute sans clic : seul le lecteur Vimeo, en https, est accepté. */
export const sanitizeVideoUrl = (value) => {
  const parsed = parseUrl(value, ["https:"]);
  if (!parsed || !VIDEO_HOSTS.includes(parsed.hostname)) return null;
  return parsed.href;
};

/** Lien affiché à partir d'une valeur reçue d'un formulaire (attributs de contact) : https uniquement. */
export const sanitizeHttpsUrl = (value) => parseUrl(value, ["https:"])?.href ?? null;
