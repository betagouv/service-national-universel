import sanitizeHtml from "sanitize-html";

import { SAFE_IMAGE_PROTOCOLS, SAFE_LINK_PROTOCOLS } from "./safeUrl.js";

// Seul rempart avant les `dangerouslySetInnerHTML` de snupport-app : les contenus rendus (messages,
// notes) viennent de contacts externes et de référents. Pas d'attribut `style` (CSS arbitraire :
// superposition, exfiltration par url()) ni de schéma `data:` dans les liens (FM23).
// Exception : les images collées dans le corps d'un e-mail arrivent en `data:` (mailparser remplace
// les `cid:`). Une image ne peut pas exécuter de script ; seuls les formats matriciels courants en
// base64 sont admis, jamais dans un href.
//
// Base commune avec `HTML_CLEANER_OPTIONS` de snu-lib (GOO-19) : mêmes balises de texte, schémas de
// liens issus du filtre d'URL partagé, `rel` imposé sur tout lien. snupport-app y ajoute les balises
// des e-mails (br, div, blockquote) et les images.
const DATA_IMAGE_URL = /^data:image\/(?:png|jpe?g|gif|webp|bmp);base64,[a-z0-9+/=\s]+$/i;

const withoutColon = (protocols) => protocols.map((protocol) => protocol.slice(0, -1));

const CLEANER_OPTIONS = {
  allowedTags: ["b", "i", "em", "strong", "a", "li", "p", "h1", "h2", "h3", "u", "ol", "ul", "br", "div", "blockquote", "img"],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    img: ["src", "alt", "width", "height", "iwc-no-src"],
  },
  allowedSchemes: withoutColon(SAFE_LINK_PROTOCOLS),
  allowedSchemesByTag: { img: [...withoutColon(SAFE_IMAGE_PROTOCOLS), "data"] },
  allowedSchemesAppliedToAttributes: ["href", "src"],
  allowProtocolRelative: false,
  transformTags: {
    img: (tagName, attribs) => {
      const src = (attribs.src || "").trim();
      if (/^data:/i.test(src)) {
        if (DATA_IMAGE_URL.test(src)) return { tagName, attribs };
        // eslint-disable-next-line no-unused-vars
        const { src: _drop, ...rest } = attribs;
        return { tagName, attribs: rest };
      }
      if (/^https?:\/\//i.test(src)) {
        // Image distante : chargée automatiquement chez l'agent dès l'ouverture du ticket, elle
        // informerait l'expéditeur d'un e-mail entrant que le message a été lu (pixel de suivi,
        // PL25). Neutralisée par défaut ; `revealRemoteImages` la restaure à la demande de l'agent.
        // eslint-disable-next-line no-unused-vars
        const { src: _drop, ...rest } = attribs;
        return { tagName, attribs: { ...rest, "iwc-no-src": src } };
      }
      return { tagName, attribs };
    },
    a: (tagName, attribs) => ({ tagName, attribs: { ...attribs, rel: "noopener noreferrer" } }),
  },
};

export const htmlCleaner = (text) => sanitizeHtml(String(text ?? ""), CLEANER_OPTIONS).trim();

/** Vrai si l'HTML assaini contient au moins une image distante neutralisée par htmlCleaner (PL25). */
export const hasHiddenRemoteImages = (html) => /\biwc-no-src=/.test(String(html ?? ""));

/**
 * Restaure les images distantes neutralisées par htmlCleaner, à la demande explicite de l'agent
 * (bouton « afficher les images »). Repasse par le même filtre de schéma que htmlCleaner : une
 * valeur dangereuse glissée directement dans `iwc-no-src` (contournement de htmlCleaner) est
 * refusée comme n'importe quel `src` d'image.
 */
export const revealRemoteImages = (html) =>
  sanitizeHtml(String(html ?? ""), {
    ...CLEANER_OPTIONS,
    transformTags: {
      ...CLEANER_OPTIONS.transformTags,
      img: (tagName, attribs) => {
        if (!attribs["iwc-no-src"]) return CLEANER_OPTIONS.transformTags.img(tagName, attribs);
        // eslint-disable-next-line no-unused-vars
        const { "iwc-no-src": src, ...rest } = attribs;
        return { tagName, attribs: { ...rest, src } };
      },
    },
  }).trim();

const URL_IN_TEXT = /https?:\/\/[^\s<>"']+/g;
const OPENING_LINK = /^<a[\s>]/i;
const CLOSING_LINK = /^<\/a\s*>/i;

/**
 * Transforme en liens les URL du texte d'un HTML déjà assaini. Seuls les nœuds texte hors d'un lien
 * sont touchés : remplacer aussi l'intérieur des balises cassait les attributs et ouvrait une
 * injection (FH14). Le résultat doit tout de même repasser par `htmlCleaner` avant rendu.
 */
export function urlify(html) {
  let linkDepth = 0;
  return String(html ?? "")
    .split(/(<[^>]*>)/g)
    .map((part) => {
      if (part.startsWith("<")) {
        if (OPENING_LINK.test(part)) linkDepth += 1;
        else if (CLOSING_LINK.test(part)) linkDepth = Math.max(0, linkDepth - 1);
        return part;
      }
      if (linkDepth > 0) return part;
      return part.replace(URL_IN_TEXT, (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`);
    })
    .join("");
}

/** HTML d'une note interne prêt à rendre : assaini, URL rendues cliquables, assaini à nouveau. */
export const noteToSafeHtml = (content) => htmlCleaner(urlify(htmlCleaner(content)));

/**
 * Texte brut d'un HTML stocké, pour un aperçu. DOMParser produit un document inerte : ni script ni
 * gestionnaire d'événement n'y s'exécute, et le texte est ensuite rendu échappé par React (FH13).
 */
export const htmlToText = (html) => {
  if (!html) return "";
  return new DOMParser().parseFromString(String(html), "text/html").body.textContent || "";
};
