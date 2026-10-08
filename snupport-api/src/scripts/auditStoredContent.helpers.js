// Contrôles par document de `auditStoredContent.js` (GOO-40, cases GOO-6 et GOO-7).
// Chaque fonction reçoit un document « lean » et renvoie la liste des constats, chacun complété du
// champ concerné (`field`). Aucune n'écrit en base.

const { findUnsafeHtml, findUnsafeSlate, findUnsafeUrlValue } = require("../utils/storedContentAudit");

const withField = (field, findings) => findings.map((finding) => ({ field, ...finding }));

// Modules de texte et signatures (`isSignature`) : HTML rendu et contenu Slate de l'éditeur.
const inspectShortcut = (doc) => [...withField("text", findUnsafeHtml(doc.text)), ...withField("content", findUnsafeSlate(doc.content, "shortcut"))];

// Tickets : notes internes, brouillon partagé et attributs de contact au format lien.
const inspectTicket = (doc) => [
  ...withField("messageDraft", findUnsafeHtml(doc.messageDraft)),
  ...(doc.notes || []).flatMap((note, index) => withField(`notes.${index}.content`, findUnsafeHtml(note && note.content))),
  ...(doc.contactAttributes || []).flatMap((attribute, index) =>
    attribute && attribute.format === "link" ? withField(`contactAttributes.${index}.value`, findUnsafeUrlValue(attribute.value, "link")) : []
  ),
];

// Macros : une action « notes.content » ajoute sa valeur comme note interne du ticket.
const inspectMacro = (doc) =>
  (doc.macroAction || []).flatMap((action, index) => (action && action.field === "notes.content" ? withField(`macroAction.${index}.value`, findUnsafeHtml(action.value)) : []));

// Modèles de ticket : message de brouillon repris dans l'éditeur.
const inspectTemplate = (doc) => withField("message", findUnsafeHtml(doc.message));

// Articles de la base de connaissance : nœuds lien, image et vidéo, et image d'illustration.
const inspectKnowledgeBase = (doc) => [...withField("content", findUnsafeSlate(doc.content, "knowledgeBase")), ...withField("imageSrc", findUnsafeUrlValue(doc.imageSrc, "image"))];

/** Compte les constats par collection, champ (sans index) et motif, pour le résumé en sortie. */
const summarize = (entries) => {
  const summary = {};
  for (const { collection, field, reason } of entries) {
    const key = `${collection}.${field.replace(/\.\d+\./g, ".")} · ${reason}`;
    summary[key] = (summary[key] || 0) + 1;
  }
  return summary;
};

module.exports = { inspectShortcut, inspectTicket, inspectMacro, inspectTemplate, inspectKnowledgeBase, summarize };
