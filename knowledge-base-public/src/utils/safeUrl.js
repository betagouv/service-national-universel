// Filtre des URL des nœuds Slate des articles (FH17). Le contenu est écrit dans l'éditeur du support
// et rendu ici sans autre contrôle : `javascript:` s'exécute dans un href au clic, et dans le src
// d'une iframe sans aucun clic.
//
// Copie conforme du filtre de référence de snu-lib (packages/lib/src/utils/safeUrl.ts) :
// knowledge-base-public est hors des workspaces npm et ne peut pas en dépendre. Toute modification se
// fait d'abord là-bas et dans ses vecteurs partagés (packages/lib/src/utils/safeUrl.vectors.json),
// rejoués par les copies de snupport-app et snupport-api (GOO-19).

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

// Chemin absolu du site courant, sans `//` ni `/\` qui feraient changer d'hôte.
const SITE_PATH = /^\/(?![/\\])/;
const isSitePath = (value) => typeof value === "string" && SITE_PATH.test(value.trim());

/** Lien d'article : http, https, mailto ou lien interne `/base-de-connaissance/...` ; sinon null. */
export const sanitizeLinkUrl = (value) => {
  if (isSitePath(value)) return value.trim();
  return parseAbsoluteUrl(value, SAFE_LINK_PROTOCOLS)?.href ?? null;
};

/** Image : http ou https ; sinon null. */
export const sanitizeImageUrl = (value) => parseAbsoluteUrl(value, SAFE_IMAGE_PROTOCOLS)?.href ?? null;

/** Vidéo (iframe) : lecteur Vimeo en https uniquement ; sinon null. */
export const sanitizeVideoUrl = (value) => {
  const parsed = parseAbsoluteUrl(value, ["https:"]);
  if (!parsed || !SAFE_VIDEO_HOSTS.includes(parsed.hostname)) return null;
  return parsed.href;
};
