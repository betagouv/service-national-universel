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

module.exports = { formatProgress };
