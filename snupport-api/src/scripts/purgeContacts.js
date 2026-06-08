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

const DRY_RUN = process.env.DRY_RUN === "true";
const EMAILS_FILE = process.env.EMAILS_FILE || "./emails.json";

function loadEmails() {
  const raw = require(path.resolve(EMAILS_FILE));
  const emails = (Array.isArray(raw) ? raw : raw.emails) || [];
  // dedup + minuscules (les contacts support sont stockés en minuscules)
  return [...new Set(emails.filter(Boolean).map((e) => String(e).trim().toLowerCase()))];
}

async function purgeByEmail(email, stats) {
  const contact = await ContactModel.findOne({ email });
  // Tickets retrouvés par email ET par contactId : après un re-run partiel, les
  // tickets restants matchent encore via le contact (non encore supprimé).
  const or = [{ contactEmail: email }];
  if (contact) or.push({ contactId: String(contact._id) });
  const tickets = await TicketModel.find({ $or: or });

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
      }
    }
    // 2) messages, puis le ticket.
    if (!DRY_RUN) await MessageModel.deleteMany({ ticketId: String(ticket._id) });
    stats.messages += messages.length;
    if (!DRY_RUN) await ticket.deleteOne();
    stats.tickets++;
  }

  // 3) Contact EN DERNIER → re-run rejouable (tant qu'il existe, on le retrouve par email).
  if (contact) {
    if (!DRY_RUN) await contact.deleteOne();
    stats.contacts++;
  }
}

async function main() {
  const emails = loadEmails();
  const stats = { contacts: 0, tickets: 0, messages: 0, files: 0, skipped: 0 };
  // eslint-disable-next-line no-console
  console.log(`${DRY_RUN ? "[DRY-RUN] " : ""}${emails.length} emails à traiter (source: ${EMAILS_FILE})`);

  for (const email of emails) {
    await purgeByEmail(email, stats);
  }

  // eslint-disable-next-line no-console
  console.log(JSON.stringify({ ok: true, dryRun: DRY_RUN, emails: emails.length, ...stats }, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  });
