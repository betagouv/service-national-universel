// Détection des contenus piégés déjà stockés avant les correctifs GOO-6 (#5361) et GOO-7 (#5364).
// Ces correctifs assainissent à l'écriture et au rendu ; ils ne disent pas si une charge a été
// stockée avant leur déploiement. Ce module repère, sans rien modifier :
// - dans le HTML (modules de texte, signatures, notes internes, brouillons, modèles, macros) : un
//   attribut d'événement (`on*`), une balise <script>, une iframe (ou frame, embed, object) hors du
//   lecteur Vimeo, une URL dont le schéma n'est pas http(s) ou mailto ;
// - dans un contenu Slate (modules de texte, articles de la base de connaissance) : une URL refusée
//   par le filtre partagé (`safeUrl.js`) ou un attribut href/src porté par un nœud qui ne devrait pas
//   en avoir.
// Utilisé par `scripts/auditStoredContent.js` (contrôle post-déploiement GOO-40).

const sanitizeHtml = require("sanitize-html");
const { SAFE_LINK_PROTOCOLS, SAFE_IMAGE_PROTOCOLS, sanitizeImageUrl, sanitizeLinkUrl, sanitizeVideoUrl } = require("./safeUrl");

const MAX_DETAIL_LENGTH = 120;
const MAX_SLATE_DEPTH = 64;

const FRAME_TAGS = ["iframe", "frame", "embed", "object"];
const LINK_ATTRIBUTES = ["href", "xlink:href", "action", "formaction"];
const RESOURCE_ATTRIBUTES = ["src", "data", "poster", "background", "srcset"];

const truncate = (value) => {
  const text = String(value);
  return text.length > MAX_DETAIL_LENGTH ? `${text.slice(0, MAX_DETAIL_LENGTH)}…` : text;
};

// Un navigateur ignore les tabulations et retours à la ligne dans une URL, et les caractères de
// contrôle ou espaces en tête : `java\tscript:` s'exécute comme `javascript:`.
const schemeOf = (value) => {
  // eslint-disable-next-line no-control-regex
  const compact = String(value).replace(/[\u0000-\u0020\u007f]/g, "");
  const match = /^([a-z][a-z0-9+.-]*):/i.exec(compact);
  return match ? `${match[1].toLowerCase()}:` : null;
};

// Une URL relative (sans schéma) ne s'exécute pas : seul un schéma hors liste blanche est signalé.
const hasForbiddenScheme = (value, protocols) => {
  const scheme = schemeOf(value);
  return scheme !== null && !protocols.includes(scheme);
};

/**
 * Liste les constructions dangereuses d'un fragment HTML stocké.
 * Renvoie un tableau de { reason, tag, attribute?, detail } (vide si rien n'est trouvé).
 */
const findUnsafeHtml = (html) => {
  if (typeof html !== "string" || !html) return [];
  const findings = [];
  sanitizeHtml(html, {
    allowedTags: false,
    allowedAttributes: false,
    allowVulnerableTags: true,
    transformTags: {
      "*": (tagName, attribs) => {
        const tag = tagName.toLowerCase();
        if (tag === "script") findings.push({ reason: "script", tag, detail: "<script>" });
        for (const [name, value] of Object.entries(attribs)) {
          const attribute = name.toLowerCase();
          if (attribute.startsWith("on")) {
            findings.push({ reason: "event-handler", tag, attribute, detail: truncate(value) });
          } else if (attribute === "srcdoc") {
            findings.push({ reason: "frame", tag, attribute, detail: truncate(value) });
          } else if (FRAME_TAGS.includes(tag) && (attribute === "src" || attribute === "data")) {
            if (sanitizeVideoUrl(value) === null) findings.push({ reason: "frame", tag, attribute, detail: truncate(value) });
          } else if (LINK_ATTRIBUTES.includes(attribute) && hasForbiddenScheme(value, SAFE_LINK_PROTOCOLS)) {
            findings.push({ reason: "url", tag, attribute, detail: truncate(value) });
          } else if (RESOURCE_ATTRIBUTES.includes(attribute) && hasForbiddenScheme(value, SAFE_IMAGE_PROTOCOLS)) {
            findings.push({ reason: "url", tag, attribute, detail: truncate(value) });
          }
        }
        // Une iframe sans src (srcdoc, ou src ajouté par script) reste hors du lecteur Vimeo.
        if (FRAME_TAGS.includes(tag) && !("src" in attribs) && !("data" in attribs) && !("srcdoc" in attribs)) findings.push({ reason: "frame", tag, detail: `<${tag}> sans src` });
        return { tagName, attribs };
      },
    },
  });
  return findings;
};

// Règles d'URL des nœuds Slate, alignées sur ce que l'API accepte désormais à l'écriture.
// - Modules de texte (`userContent.js`) : seuls link, image et video portent une URL, lien absolu.
// - Articles de la base de connaissance (`knowledgeBaseContent.js`) : tout nœud portant `url` est
//   contrôlé, les liens internes (`/base-de-connaissance/…`) sont acceptés.
const SLATE_RULES = {
  shortcut: (node) => {
    if (node.type === "link") return sanitizeLinkUrl(node.url) !== null;
    if (node.type === "image") return sanitizeImageUrl(node.url) !== null;
    if (node.type === "video") return sanitizeVideoUrl(node.url) !== null;
    return false;
  },
  knowledgeBase: (node) => {
    if (node.type === "image") return sanitizeImageUrl(node.url) !== null;
    if (node.type === "video") return sanitizeVideoUrl(node.url) !== null;
    return sanitizeLinkUrl(node.url, { allowSitePath: true }) !== null;
  },
};

/**
 * Liste les URL refusées d'un contenu Slate. `rule` vaut "shortcut" ou "knowledgeBase".
 * Renvoie un tableau de { reason, type, attribute, detail } (vide si rien n'est trouvé).
 */
const findUnsafeSlate = (nodes, rule) => {
  const isAllowed = SLATE_RULES[rule];
  if (!isAllowed) throw new Error(`règle Slate inconnue : ${rule}`);
  const findings = [];
  const walk = (list, depth) => {
    if (!Array.isArray(list)) return;
    if (depth > MAX_SLATE_DEPTH) {
      findings.push({ reason: "structure", detail: "contenu trop imbriqué" });
      return;
    }
    for (const node of list) {
      if (!node || typeof node !== "object") continue;
      if (Object.prototype.hasOwnProperty.call(node, "url") && !isAllowed(node)) {
        findings.push({ reason: "url", type: node.type, attribute: "url", detail: truncate(node.url) });
      }
      for (const attribute of ["href", "src"]) {
        if (Object.prototype.hasOwnProperty.call(node, attribute)) findings.push({ reason: "url", type: node.type, attribute, detail: truncate(node[attribute]) });
      }
      walk(node.children, depth + 1);
    }
  };
  walk(nodes, 0);
  return findings;
};

/**
 * Contrôle une URL isolée. `image` (image d'un article) : http(s) absolu exigé, comme à l'écriture.
 * `link` (attribut de contact au format lien, saisi librement) : seul un schéma hors http(s)/mailto
 * est signalé, pour ne pas remonter les liens écrits sans schéma (`www.exemple.fr`).
 */
const findUnsafeUrlValue = (value, kind) => {
  if (value === undefined || value === null || value === "") return [];
  const unsafe = kind === "image" ? sanitizeImageUrl(value) === null : hasForbiddenScheme(value, SAFE_LINK_PROTOCOLS);
  return unsafe ? [{ reason: "url", detail: truncate(value) }] : [];
};

module.exports = { findUnsafeHtml, findUnsafeSlate, findUnsafeUrlValue };
