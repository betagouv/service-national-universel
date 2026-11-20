/**
 * Contrôle post-déploiement GOO-40 (cases GOO-6 et GOO-7) — LECTURE SEULE.
 *
 * Les correctifs #5361 (GOO-6) et #5364 (GOO-7) assainissent les contenus à l'écriture et au rendu,
 * mais ne disent pas si une charge a été stockée avant leur déploiement. Ce script parcourt la base
 * support et liste les contenus qui portent encore :
 * - un attribut d'événement HTML (`on*`), une balise <script>, une iframe hors player.vimeo.com, ou
 *   une URL dont le schéma n'est pas http(s)/mailto : modules de texte et signatures (shortcuts),
 *   notes internes et brouillons (`messageDraft`) des tickets, actions « note » des macros, modèles ;
 * - une URL refusée par le filtre partagé dans les nœuds lien, image ou vidéo des articles de la
 *   base de connaissance, ou dans leur `imageSrc`.
 *
 * Aucune écriture : la correction se décide au cas par cas (un article piégé n'est plus modifiable
 * tel quel, `PUT /knowledge-base/:id/content` refusant désormais ces URL).
 *
 * Sortie : un résumé par collection, champ et motif sur la sortie standard (sans contenu), et le
 * détail (collection, _id, champ, motif, extrait tronqué) en JSONL dans REPORT_FILE, créé en 0600
 * car les extraits peuvent venir de notes internes. Ne pas commiter ce fichier.
 *
 * Usage (depuis snupport-api/, avec le MONGO_URL de la base support) :
 *   REPORT_FILE=./audit-stored-content.jsonl npx tsx src/scripts/auditStoredContent.js
 * Code de sortie : 0 si rien n'est trouvé, 2 si des contenus sont à traiter, 1 en cas d'erreur.
 */
const db = require("../mongo");
const fs = require("fs");
const path = require("path");

const ShortcutModel = require("../models/shortcut");
const TicketModel = require("../models/ticket");
const MacroModel = require("../models/macro");
const TemplateModel = require("../models/template");
const KnowledgeBaseModel = require("../models/knowledgeBase");
const { inspectShortcut, inspectTicket, inspectMacro, inspectTemplate, inspectKnowledgeBase, summarize } = require("./auditStoredContent.helpers");

const REPORT_FILE = process.env.REPORT_FILE || "./audit-stored-content.jsonl";

// Filtres de pré-sélection : seuls les documents dont un champ contrôlé est renseigné sont lus.
const SOURCES = [
  { collection: "shortcut", model: ShortcutModel, query: {}, projection: { text: 1, content: 1, isSignature: 1 }, inspect: inspectShortcut },
  {
    collection: "ticket",
    model: TicketModel,
    query: { $or: [{ messageDraft: { $nin: [null, ""] } }, { "notes.0": { $exists: true } }, { "contactAttributes.format": "link" }] },
    projection: { messageDraft: 1, notes: 1, contactAttributes: 1 },
    inspect: inspectTicket,
  },
  { collection: "macro", model: MacroModel, query: { "macroAction.field": "notes.content" }, projection: { macroAction: 1 }, inspect: inspectMacro },
  { collection: "template", model: TemplateModel, query: {}, projection: { message: 1 }, inspect: inspectTemplate },
  { collection: "knowledgebase", model: KnowledgeBaseModel, query: {}, projection: { content: 1, imageSrc: 1, slug: 1 }, inspect: inspectKnowledgeBase },
];

async function main() {
  await db.asPromise();
  const reportPath = path.resolve(REPORT_FILE);
  fs.writeFileSync(reportPath, "", { mode: 0o600 });

  const entries = [];
  const scanned = {};
  for (const { collection, model, query, projection, inspect } of SOURCES) {
    scanned[collection] = 0;
    for await (const doc of model.find(query, projection).lean().cursor()) {
      scanned[collection]++;
      for (const finding of inspect(doc)) {
        const entry = { collection, _id: String(doc._id), ...(doc.slug ? { slug: doc.slug } : {}), ...(doc.isSignature ? { isSignature: true } : {}), ...finding };
        entries.push(entry);
        fs.appendFileSync(reportPath, `${JSON.stringify(entry)}\n`);
      }
    }
  }

  const documents = new Set(entries.map(({ collection, _id }) => `${collection}:${_id}`)).size;
  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify({ ok: true, scanned, findings: entries.length, documents, summary: summarize(entries), ...(entries.length ? { reportFile: reportPath } : {}) }, null, 2)
  );
  return entries.length;
}

main()
  .then(async (findings) => {
    await db.close();
    process.exit(findings > 0 ? 2 : 0);
  })
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  });
