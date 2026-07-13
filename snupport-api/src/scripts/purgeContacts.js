/**
 * Script one-shot — Suppression RGPD (hard-delete) de la trace support de jeunes
 * supprimés côté SNU : Contact + ses Tickets + leurs Messages + pièces jointes S3.
 *
 * Aligné sur le « on ne garde rien » du jeune côté SNU : on supprime réellement les
 * enregistrements, on ne masque pas.
 *
 * Entrée : un fichier (JSON ou JSONL) d'emails (jeune + parents), exporté côté SNU
 * AVANT l'anonymisation SNU (sinon les emails y sont déjà masqués). Chemin via
 * EMAILS_FILE (défaut ./emails.json). Le Contact support est clé par email.
 *
 * Résilience : une erreur sur UN email (ex. clé S3 introuvable) n'arrête pas le
 * lot — l'email fautif est journalisé en JSONL dans ERRORS_FILE et le script
 * poursuit, puis sort en code non-zéro s'il reste des erreurs. Le fichier
 * d'erreurs est réinjectable tel quel via EMAILS_FILE (re-run des seuls échecs).
 *
 * PRÉREQUIS : mongodump du Mongo support AVANT exécution (irréversible).
 *
 * Usage (depuis snupport-api/) :
 *   DRY_RUN=true EMAILS_FILE=./emails.json node src/scripts/purgeContacts.js   # aperçu (compte, aucune écriture)
 *   EMAILS_FILE=./emails.json node src/scripts/purgeContacts.js                # exécution
 *   EMAILS_FILE=./purge-contacts-errors.json node src/scripts/purgeContacts.js # re-run des échecs
 */
require("../mongo");
const fs = require("fs");
const path = require("path");

const ContactModel = require("../models/contact");
const TicketModel = require("../models/ticket");
const MessageModel = require("../models/message");
const { deleteFile } = require("../utils");
const { filePathsOf } = require("../utils/messageAttachments");
const { formatProgress, loadEmailsFromContent } = require("./purgeContacts.helpers");

const DRY_RUN_RAW = process.env.DRY_RUN;
// Fail-fast : DRY_RUN=1 / TRUE / yes serait silencieusement un run RÉEL destructif.
if (DRY_RUN_RAW !== undefined && !["true", "false"].includes(DRY_RUN_RAW)) {
  // eslint-disable-next-line no-console
  console.error(`DRY_RUN="${DRY_RUN_RAW}" non reconnu — utiliser DRY_RUN=true ou DRY_RUN=false.`);
  process.exit(1);
}
const DRY_RUN = DRY_RUN_RAW === "true";
const EMAILS_FILE = process.env.EMAILS_FILE || "./emails.json";
const ERRORS_FILE = process.env.ERRORS_FILE || "./purge-contacts-errors.json";

function loadEmails() {
  return loadEmailsFromContent(fs.readFileSync(path.resolve(EMAILS_FILE), "utf8"));
}

function ensureErrorsFileExists(filePath) {
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, "", { mode: 0o600 });
}

function appendErrorEntry(filePath, entry) {
  fs.appendFileSync(filePath, `${JSON.stringify(entry)}\n`, { mode: 0o600 });
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
    return 0;
  }

  // --- Suppression réelle, barre de progression « par objet » ---
  const stats = { contacts: 0, tickets: 0, messages: 0, files: 0, skipped: 0 };
  const showProgress = Boolean(process.stdout.isTTY) && totalObjects > 0;
  const renderProgress = () => {
    if (!showProgress) return;
    process.stdout.write(`\r${formatProgress(stats, totals)}`);
  };
  renderProgress();

  const errorsPath = path.resolve(ERRORS_FILE);
  ensureErrorsFileExists(errorsPath);
  let errors = 0;

  for (const email of emails) {
    try {
      await purgeByEmail(email, stats, renderProgress);
    } catch (e) {
      // Isolation par email : on journalise l'échec et on poursuit le lot.
      // La suppression étant ordonnée (contact en DERNIER), le fichier d'erreurs
      // est réinjectable via EMAILS_FILE pour reprendre proprement les échecs.
      errors++;
      appendErrorEntry(errorsPath, { email, reason: (e && e.message) || String(e) });
      if (showProgress) process.stdout.write("\n");
      // eslint-disable-next-line no-console
      console.error(`Erreur sur ${email} : ${(e && e.message) || String(e)}`);
      renderProgress();
    }
  }
  if (showProgress) process.stdout.write("\n");

  // eslint-disable-next-line no-console
  console.log(JSON.stringify({ ok: errors === 0, dryRun: false, emails: emails.length, ...stats, errors, ...(errors > 0 ? { errorsFile: ERRORS_FILE } : {}) }, null, 2));
  return errors;
}

main()
  .then((errors) => process.exit(errors > 0 ? 1 : 0))
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  });
