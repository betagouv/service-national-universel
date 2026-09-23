// Filtre des URL des nœuds Slate des articles (FH17). Le contenu est écrit dans l'éditeur du support
// et rendu ici sans autre contrôle : `javascript:` s'exécute dans un href au clic, et dans le src
// d'une iframe sans aucun clic. Même liste blanche que la validation de snupport-api
// (src/utils/knowledgeBaseContent.js) ; à remplacer par le filtre partagé de snu-lib (GOO-19).

const LINK_PROTOCOLS = ["http:", "https:", "mailto:"];
const IMAGE_PROTOCOLS = ["http:", "https:"];
const VIDEO_HOSTS = ["player.vimeo.com"];

const parseAbsoluteUrl = (value, protocols) => {
  if (typeof value !== "string") return null;
  let parsed;
  try {
    parsed = new URL(value.trim());
  } catch {
    return null;
  }
  return protocols.includes(parsed.protocol) ? parsed : null;
};

/** Lien d'article : http, https, mailto ou lien interne `/base-de-connaissance/...` ; sinon null. */
export const sanitizeLinkUrl = (value) => {
  if (typeof value === "string" && /^\/(?![/\\])/.test(value.trim())) return value.trim();
  return parseAbsoluteUrl(value, LINK_PROTOCOLS)?.href ?? null;
};

/** Image : http ou https ; sinon null. */
export const sanitizeImageUrl = (value) => parseAbsoluteUrl(value, IMAGE_PROTOCOLS)?.href ?? null;

/** Vidéo (iframe) : lecteur Vimeo en https uniquement ; sinon null. */
export const sanitizeVideoUrl = (value) => {
  const parsed = parseAbsoluteUrl(value, ["https:"]);
  return parsed && VIDEO_HOSTS.includes(parsed.hostname) ? parsed.href : null;
};
