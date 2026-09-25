// Qui fait partie d'un fil de ticket. Sert dans les deux sens :
// - à l'entrée (imap.js), pour décider si un mail peut rejoindre un ticket existant ;
// - à la sortie (controllers/message.js), pour décider à qui l'historique peut être envoyé.
//
// `copyRecipient` du ticket est alimenté à la création à partir des CC/To du mail d'origine,
// donc par le demandeur lui-même.

function normalizeEmail(email) {
  return typeof email === "string" ? email.trim().toLowerCase() : null;
}

function knownThreadParticipants(ticket) {
  const participants = [normalizeEmail(ticket?.contactEmail)];
  for (const recipient of ticket?.copyRecipient ?? []) participants.push(normalizeEmail(recipient));
  return participants.filter(Boolean);
}

function isKnownThreadParticipant(ticket, email) {
  if (!ticket) return false;
  const normalized = normalizeEmail(email);
  if (!normalized) return false;
  return knownThreadParticipants(ticket).includes(normalized);
}

module.exports = { normalizeEmail, knownThreadParticipants, isKnownThreadParticipant };
