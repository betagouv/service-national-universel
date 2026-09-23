// URL des nœuds Slate des articles de la base de connaissance (M85 / FH17).
// Le contenu est rendu tel quel sur support.snu.gouv.fr et dans l'éditeur du support : une URL
// `javascript:` dans un lien s'exécute au clic, dans une iframe vidéo sans aucun clic. La même
// liste blanche est appliquée au rendu (knowledge-base-public, snupport-app) ; ici elle refuse
// l'enregistrement.

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

// Liens internes entre articles (`/base-de-connaissance/<slug>`) : chemin absolu du site, sans
// `//` ni `/\` qui feraient changer d'hôte.
const isSitePath = (value) => typeof value === "string" && /^\/(?![/\\])/.test(value.trim());

const isSafeLinkUrl = (value) => isSitePath(value) || !!parseAbsoluteUrl(value, LINK_PROTOCOLS);
const isSafeImageUrl = (value) => !!parseAbsoluteUrl(value, IMAGE_PROTOCOLS);
const isSafeVideoUrl = (value) => {
  const parsed = parseAbsoluteUrl(value, ["https:"]);
  return !!parsed && VIDEO_HOSTS.includes(parsed.hostname);
};

const isSafeNodeUrl = (node) => {
  if (node.type === "image") return isSafeImageUrl(node.url);
  if (node.type === "video") return isSafeVideoUrl(node.url);
  return isSafeLinkUrl(node.url);
};

/**
 * Parcourt un contenu Slate et renvoie la première URL refusée (avec le type du nœud), ou null.
 * Tout nœud portant une propriété `url` est contrôlé, quel que soit son type.
 */
const findUnsafeUrl = (nodes) => {
  if (!Array.isArray(nodes)) return null;
  for (const node of nodes) {
    if (!node || typeof node !== "object") continue;
    if (Object.prototype.hasOwnProperty.call(node, "url") && !isSafeNodeUrl(node)) return { type: node.type, url: node.url };
    const unsafe = findUnsafeUrl(node.children);
    if (unsafe) return unsafe;
  }
  return null;
};

module.exports = { findUnsafeUrl, isSafeLinkUrl, isSafeImageUrl, isSafeVideoUrl };
