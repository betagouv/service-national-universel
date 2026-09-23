const Joi = require("joi");
const sanitizeHtml = require("sanitize-html");

// Contenus écrits par un compte et rendus chez un autre : notes internes, brouillon partagé,
// modules de texte et signatures. Les référents en écrivent, les agents nationaux les lisent : un
// lien `javascript:` ou un gestionnaire d'événement stocké ici vaut prise de session d'agent (GOO-6).
// Le front filtre aussi au rendu ; ce module empêche la charge d'être stockée.

const LINK_PROTOCOLS = ["http:", "https:", "mailto:"];
const IMAGE_PROTOCOLS = ["http:", "https:"];
const VIDEO_HOSTS = ["player.vimeo.com"];
const MAX_SLATE_DEPTH = 32;

const HTML_OPTIONS = {
  allowedTags: ["b", "i", "em", "strong", "a", "li", "p", "h1", "h2", "h3", "u", "ol", "ul", "br", "div", "blockquote", "img", "section"],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    img: ["src", "alt", "width", "height"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesAppliedToAttributes: ["href", "src"],
  allowProtocolRelative: false,
};

const sanitizeUserHtml = (html) => (typeof html === "string" ? sanitizeHtml(html, HTML_OPTIONS) : html);

// Texte brut (notes) : aucune balise n'est conservée, le texte reste lisible.
const sanitizeUserText = (text) => (typeof text === "string" ? sanitizeHtml(text, { allowedTags: [], allowedAttributes: {} }) : text);

const parseUrl = (value, protocols) => {
  if (typeof value !== "string") return null;
  try {
    const parsed = new URL(value.trim());
    return protocols.includes(parsed.protocol) ? parsed : null;
  } catch {
    return null;
  }
};

const isAllowedNodeUrl = (type, url) => {
  if (type === "link") return !!parseUrl(url, LINK_PROTOCOLS);
  if (type === "image") return !!parseUrl(url, IMAGE_PROTOCOLS);
  if (type === "video") {
    const parsed = parseUrl(url, ["https:"]);
    return !!parsed && VIDEO_HOSTS.includes(parsed.hostname);
  }
  return false;
};

const URL_NODE_TYPES = ["link", "image", "video"];

/**
 * Neutralise les URL d'un contenu Slate. Seuls les nœuds lien, image et vidéo portent une URL, avec un
 * schéma autorisé par type : un lien refusé est remplacé par son texte, une image ou une vidéo refusée
 * est retirée, et tout autre nœud perd ses attributs url/href/src. Un contenu déjà stocké avec un lien
 * relatif reste ainsi modifiable. Lève une erreur si la structure n'est pas celle d'un contenu Slate.
 */
const sanitizeSlateContent = (nodes, depth = 0) => {
  if (!Array.isArray(nodes)) throw new Error("le contenu doit être une liste de nœuds");
  if (depth > MAX_SLATE_DEPTH) throw new Error("contenu trop imbriqué");
  const result = [];
  for (const node of nodes) {
    if (!node || typeof node !== "object" || Array.isArray(node)) throw new Error("nœud invalide");
    if ("text" in node && typeof node.text !== "string") throw new Error("texte invalide");
    // eslint-disable-next-line no-unused-vars
    const { url, href, src, ...rest } = node;
    let children = "children" in node ? sanitizeSlateContent(node.children, depth + 1) : undefined;
    // Slate exige au moins un enfant par élément : une image retirée ne doit pas laisser un bloc vide.
    if (children && !children.length) children = [{ text: "" }];
    if (URL_NODE_TYPES.includes(node.type)) {
      if (!isAllowedNodeUrl(node.type, url)) {
        if (node.type === "link" && children) result.push(...children);
        continue;
      }
      result.push({ ...rest, url: url.trim(), ...(children ? { children } : {}) });
      continue;
    }
    result.push({ ...rest, ...(children ? { children } : {}) });
  }
  return result;
};

const SCHEMA_SLATE_CONTENT = Joi.array().custom((value, helpers) => {
  try {
    return sanitizeSlateContent(value);
  } catch (error) {
    return helpers.message(`content: ${error.message}`);
  }
});

module.exports = { sanitizeUserHtml, sanitizeUserText, sanitizeSlateContent, SCHEMA_SLATE_CONTENT };
