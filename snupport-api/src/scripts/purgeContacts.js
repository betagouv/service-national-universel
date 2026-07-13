/**
 * Script one-shot — Suppression RGPD (hard-delete) de la trace support de jeunes
 * supprimés côté SNU : Contact + ses Tickets + leurs Messages + pièces jointes S3.
 *
 * Aligné sur le « on ne garde rien » du jeune côté SNU : on supprime réellement les
 * enregistrements, on ne masque pas.
 *
 * Entrée : un fichier JSON = tableau d'emails (jeune + parents), exporté côté SNU
 * AVANT l'anonymisation SNU (sinon les emails y sont déjà masqués). Chemin via
 * EMAILS_FILE (défaut ./emails.json). Le Contact support est clé par email.
 *
 * PRÉREQUIS : mongodump du Mongo support AVANT exécution (irréversible).
 *
 * Usage (depuis snupport-api/) :
 *   DRY_RUN=true EMAILS_FILE=./emails.json node src/scripts/purgeContacts.js   # aperçu (compte, aucune écriture)
 *   EMAILS_FILE=./emails.json node src/scripts/purgeContacts.js                # exécution
 */
require("../mongo");
const path = require("path");

const ContactModel = require("../models/contact");
const TicketModel = require("../models/ticket");
const MessageModel = require("../models/message");
const { deleteFile } = require("../utils");
const { filePathsOf } = require("../utils/messageAttachments");
const { formatProgress } = require("./purgeContacts.helpers");

const DRY_RUN_RAW = process.env.DRY_RUN;
// Fail-fast : DRY_RUN=1 / TRUE / yes serait silencieusement un run RÉEL destructif.
if (DRY_RUN_RAW !== undefined && !["true", "false"].includes(DRY_RUN_RAW)) {
  // eslint-disable-next-line no-console
  console.error(`DRY_RUN="${DRY_RUN_RAW}" non reconnu — utiliser DRY_RUN=true ou DRY_RUN=false.`);
  process.exit(1);
}
const DRY_RUN = DRY_RUN_RAW === "true";
const EMAILS_FILE = process.env.EMAILS_FILE || "./emails.json";

function loadEmails() {
  const raw = require(path.resolve(EMAILS_FILE));
  const emails = (Array.isArray(raw) ? raw : raw.emails) || [];
  // dedup + minuscules (les contacts support sont stockés en minuscules)
  return [...new Set(emails.filter(Boolean).map((e) => String(e).trim().toLowerCase()))];
}

// Retrouve le contact + ses tickets pour un email. Tickets par email ET par
// contactId : après un re-run partiel, les tickets restants matchent encore via
// le contact (non encore supprimé).
async function findTargets(email) {
  const contact = await ContactModel.findOne({ email });
  const or = [{ contactEmail: email }];
  if (contact) or.push({ contactId: String(contact._id) });
  const tickets = await TicketModel.find({ $or: or });
  return { contact, tickets };
}

// Pré-comptage (lecture seule) des objets qui seront supprimés pour un email —
// alimente le total de la barre de progression AVANT toute suppression.
async function countByEmail(email) {
  const { contact, tickets } = await findTargets(email);
  if (!contact && tickets.length === 0) {
    return { contacts: 0, tickets: 0, messages: 0, files: 0, skipped: 1 };
  }
  let messages = 0;
  let files = 0;
  for (const ticket of tickets) {
    const msgs = await MessageModel.find({ ticketId: String(ticket._id) });
    messages += msgs.length;
    for (const message of msgs) files += filePathsOf(message).length;
  }
  return { contacts: contact ? 1 : 0, tickets: tickets.length, messages, files, skipped: 0 };
}

async function purgeByEmail(email, stats, onProgress = () => {}) {
  const { contact, tickets } = await findTargets(email);

  if (!contact && tickets.length === 0) {
    stats.skipped++;
    return;
  }

  for (const ticket of tickets) {
    const messages = await MessageModel.find({ ticketId: String(ticket._id) });
    // 1) fichiers S3 d'abord (sinon on perd les `path` et les binaires fuient).
    for (const message of messages) {
      for (const key of filePathsOf(message)) {
        if (!DRY_RUN) await deleteFile(key);
        stats.files++;
        onProgress();
      }
    }
    // 2) messages, puis le ticket.
    if (!DRY_RUN) await MessageModel.deleteMany({ ticketId: String(ticket._id) });
    stats.messages += messages.length;
    onProgress();
    if (!DRY_RUN) await ticket.deleteOne();
    stats.tickets++;
    onProgress();
  }

  // 3) Contact EN DERNIER → re-run rejouable (tant qu'il existe, on le retrouve par email).
  if (contact) {
    if (!DRY_RUN) await contact.deleteOne();
    stats.contacts++;
    onProgress();
  }
}

async function main() {
  const mode = DRY_RUN ? "[DRY-RUN] " : "";
  const emails = loadEmails();

  // --- Pré-comptage (lecture seule) : total d'objets pour la barre de progression ---
  // eslint-disable-next-line no-console
  console.log(`${mode}Comptage du périmètre sur ${emails.length} emails (source: ${EMAILS_FILE})...`);
  const totals = { contacts: 0, tickets: 0, messages: 0, files: 0, skipped: 0 };
  for (const email of emails) {
    const c = await countByEmail(email);
    totals.contacts += c.contacts;
    totals.tickets += c.tickets;
    totals.messages += c.messages;
    totals.files += c.files;
    totals.skipped += c.skipped;
  }
  const totalObjects = totals.contacts + totals.tickets + totals.messages + totals.files;
  // eslint-disable-next-line no-console
  console.log(
    `${mode}${emails.length} emails · ${totalObjects} objets à supprimer ` +
      `(contacts ${totals.contacts}, tickets ${totals.tickets}, messages ${totals.messages}, files ${totals.files}` +
      `${totals.skipped ? `, ${totals.skipped} emails sans trace` : ""})`
  );

  // En DRY-RUN, le pré-comptage EST le résultat : rien à supprimer, on rapporte.
  if (DRY_RUN) {
    // eslint-disable-next-line no-console
    console.log(
      JSON.stringify(
        {
          ok: true,
          dryRun: true,
          emails: emails.length,
          contacts: totals.contacts,
          tickets: totals.tickets,
          messages: totals.messages,
          files: totals.files,
          skipped: totals.skipped,
        },
        null,
        2
      )
    );
    return;
  }

  // --- Suppression réelle, barre de progression « par objet » ---
  const stats = { contacts: 0, tickets: 0, messages: 0, files: 0, skipped: 0 };
  const showProgress = Boolean(process.stdout.isTTY) && totalObjects > 0;
  const renderProgress = () => {
    if (!showProgress) return;
    process.stdout.write(`\r${formatProgress(stats, totals)}`);
  };
  renderProgress();

  for (const email of emails) {
    await purgeByEmail(email, stats, renderProgress);
  }
  if (showProgress) process.stdout.write("\n");

  // eslint-disable-next-line no-console
  console.log(JSON.stringify({ ok: true, dryRun: false, emails: emails.length, ...stats }, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  });
