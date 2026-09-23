import sanitizeHtml from "sanitize-html";

// Seul rempart avant les `dangerouslySetInnerHTML` de snupport-app : les contenus rendus (messages,
// notes) viennent de contacts externes et de référents. Pas d'attribut `style` (CSS arbitraire :
// superposition, exfiltration par url()) ni de schéma `data:` (FM23).
const CLEANER_OPTIONS = {
  allowedTags: ["b", "i", "em", "strong", "a", "li", "p", "h1", "h2", "h3", "u", "ol", "br", "div", "blockquote", "img"],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    img: ["src", "alt", "width", "height", "iwc-no-src"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesAppliedToAttributes: ["href", "src"],
  allowProtocolRelative: false,
  transformTags: {
    a: (tagName, attribs) => {
      if (attribs.target !== "_blank") return { tagName, attribs };
      return { tagName, attribs: { ...attribs, rel: "noopener noreferrer" } };
    },
  },
};

export const htmlCleaner = (text) => sanitizeHtml(String(text ?? ""), CLEANER_OPTIONS).trim();

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
