/**
 * Helpers purs (sans I/O) pour purgeContacts.js — testables unitairement.
 */

/**
 * Construit la ligne de barre de progression « par objet » : avancement global
 * (contacts + tickets + messages + fichiers S3) + détail par type.
 *
 * @param {{contacts:number,tickets:number,messages:number,files:number}} done   objets déjà supprimés
 * @param {{contacts:number,tickets:number,messages:number,files:number}} totals objets à supprimer (pré-comptés)
 * @param {number} width largeur de la barre (défaut 30)
 * @returns {string}
 */
function formatProgress(done, totals, width = 30) {
  const doneTotal = done.contacts + done.tickets + done.messages + done.files;
  const grandTotal = totals.contacts + totals.tickets + totals.messages + totals.files;
  const ratio = grandTotal > 0 ? doneTotal / grandTotal : 0;
  const filled = Math.min(width, Math.round(ratio * width));
  const bar = "█".repeat(filled) + "░".repeat(width - filled);
  const pct = Math.floor(ratio * 100);
  return (
    `[${bar}] ${doneTotal}/${grandTotal} objets (${pct}%) — ` +
    `contacts ${done.contacts}/${totals.contacts} · ` +
    `tickets ${done.tickets}/${totals.tickets} · ` +
    `messages ${done.messages}/${totals.messages} · ` +
    `files ${done.files}/${totals.files}`
  );
}

/** Extrait un email d'un item : chaîne, ou objet { email } (format du fichier d'erreurs JSONL). */
function extractEmail(item) {
  if (typeof item === "string") return item;
  if (item && typeof item === "object" && typeof item.email === "string") return item.email;
  return null;
}

/** dedup + trim + minuscules (les contacts support sont stockés en minuscules). */
function normalizeEmails(emails) {
  return [...new Set(emails.map((e) => String(e).trim().toLowerCase()).filter((e) => e.length > 0))];
}

/**
 * Parse le contenu d'un fichier d'emails, tolérant à 3 formats :
 *   - tableau JSON : ["a@x", "b@y"]
 *   - objet { "emails": [...] }
 *   - JSONL { "email", "reason" } par ligne (re-run depuis ERRORS_FILE)
 * Permet de relancer directement la purge sur le fichier d'erreurs généré.
 */
function loadEmailsFromContent(content) {
  const trimmed = String(content).trim();
  if (!trimmed) return [];

  try {
    const raw = JSON.parse(trimmed);
    const items = Array.isArray(raw) ? raw : Array.isArray(raw && raw.emails) ? raw.emails : [raw];
    return normalizeEmails(items.map(extractEmail).filter((e) => e !== null));
  } catch {
    // Pas du JSON valide → tenter du JSONL (une entrée par ligne).
    const fromJsonl = trimmed
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .flatMap((line) => {
        try {
          const email = extractEmail(JSON.parse(line));
          return email ? [email] : [];
        } catch {
          return [];
        }
      });
    return normalizeEmails(fromJsonl);
  }
}

module.exports = { formatProgress, loadEmailsFromContent };
