const { normalizeEmail, knownThreadParticipants, isKnownThreadParticipant } = require("./ticketParticipants");

// Le rattachement d'un mail entrant à un ticket existant ne repose que sur des éléments que
// l'expéditeur contrôle entièrement : le numéro « [#1234] » du sujet (les numéros sont
// séquentiels, donc devinables) et le premier en-tête References. Un tiers pouvait ainsi
// s'insérer dans le fil de n'importe quel ticket, puis recevoir tout l'historique et les
// pièces jointes déchiffrées dès qu'un agent répondait depuis son message.
//
// On n'accepte donc le rattachement que si l'expéditeur fait déjà partie du fil. Sinon on
// échoue en fermé : le mail n'est pas perdu, il donne lieu à un nouveau ticket.
function canSenderJoinTicket(ticket, fromAddress) {
  return isKnownThreadParticipant(ticket, fromAddress);
}

module.exports = { canSenderJoinTicket, knownThreadParticipants, normalizeEmail };
