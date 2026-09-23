const sanitizeHtml = require("sanitize-html");

// HTML des messages de ticket (M92, M97). Il arrive de trois sources que l'expéditeur contrôle :
// le texte d'un jeune ou d'un visiteur anonyme (POST /v0/message), le corps d'un mail entrant (IMAP)
// et l'éditeur des agents, référents compris. Il est ensuite rendu dans snupport-app, dans les
// échanges du jeune (app, admin) et renvoyé dans les emails officiels du support. On l'assainit donc
// côté serveur, à l'entrée comme avant toute émission d'email, sur une liste blanche.

const MESSAGE_HTML_OPTIONS = {
  allowedTags: [
    "p",
    "br",
    "div",
    "span",
    "a",
    "b",
    "strong",
    "i",
    "em",
    "u",
    "s",
    "sub",
    "sup",
    "small",
    "blockquote",
    "pre",
    "code",
    "hr",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "ul",
    "ol",
    "li",
    "table",
    "thead",
    "tbody",
    "tfoot",
    "tr",
    "th",
    "td",
    "img",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    img: ["src", "alt", "width", "height"],
    // Seul le bandeau de citation de l'historique (« Répondre avec historique ») garde un style.
    blockquote: ["style"],
    td: ["colspan", "rowspan"],
    th: ["colspan", "rowspan"],
  },
  allowedStyles: {
    blockquote: {
      "border-left": [/^\d+px solid$/],
      padding: [/^(\d+px\s*){1,4}$/],
    },
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesByTag: { img: ["http", "https"] },
  allowedSchemesAppliedToAttributes: ["href", "src"],
  allowProtocolRelative: false,
  transformTags: {
    // Un lien d'un message ouvre toujours un nouvel onglet sans accès à la fenêtre d'origine.
    a: sanitizeHtml.simpleTransform("a", { target: "_blank", rel: "noopener noreferrer" }),
  },
};

const sanitizeMessageHtml = (html) => (typeof html === "string" ? sanitizeHtml(html, MESSAGE_HTML_OPTIONS) : "");

const escapeHtml = (text) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

// Le texte saisi dans les formulaires (jeune, visiteur anonyme) est du texte brut : on l'échappe avant
// de le mettre en forme, puis on rend ses URL cliquables. Il était auparavant concaténé tel quel dans
// le HTML stocké.
const plainTextToMessageHtml = (text) => {
  if (typeof text !== "string") return "";
  const escaped = escapeHtml(text).replaceAll("\n", " <br> ");
  const linked = escaped.replace(/(https?:\/\/[^\s<]+)/g, (url) => ` <a href="${url}" target="_blank"> ${url} </a> `);
  return sanitizeMessageHtml(`<p> ${linked} </p>`);
};

module.exports = { sanitizeMessageHtml, plainTextToMessageHtml, MESSAGE_HTML_OPTIONS };
