// Le rattachement d'un mail entrant à un ticket existant ne repose que sur des éléments que
// l'expéditeur contrôle entièrement : le numéro « [#1234] » du sujet (les numéros sont
// séquentiels, donc devinables) et le premier en-tête References. Un tiers pouvait ainsi
// s'insérer dans le fil de n'importe quel ticket, puis recevoir tout l'historique et les
// pièces jointes déchiffrées dès qu'un agent répondait depuis son message.
//
// On n'accepte donc le rattachement que si l'expéditeur fait déjà partie du fil : le contact
// du ticket, ou une adresse déjà en copie sur le ticket. Sinon on échoue en fermé : le mail
// n'est pas perdu, il donne lieu à un nouveau ticket.

function normalizeEmail(email) {
  return typeof email === "string" ? email.trim().toLowerCase() : null;
}

// Adresses considérées comme déjà membres du fil. `copyRecipient` du ticket est alimenté à la
// création du ticket à partir des CC/To du mail d'origine, donc par le demandeur lui-même.
function knownThreadParticipants(ticket) {
  const participants = [normalizeEmail(ticket?.contactEmail)];
  for (const recipient of ticket?.copyRecipient ?? []) participants.push(normalizeEmail(recipient));
  return participants.filter(Boolean);
}

function canSenderJoinTicket(ticket, fromAddress) {
  if (!ticket) return false;
  const sender = normalizeEmail(fromAddress);
  if (!sender) return false;
  return knownThreadParticipants(ticket).includes(sender);
}

module.exports = { canSenderJoinTicket, knownThreadParticipants, normalizeEmail };
