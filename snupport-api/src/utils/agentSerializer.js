// Toute réponse HTTP exposant un agent passe par ces sérialiseurs. On liste les champs publics plutôt que de
// retirer les champs sensibles : le document porte l'empreinte et l'expiration du jeton de réinitialisation,
// les dates d'invalidation de session et l'identifiant SNU du référent, qu'aucun autre agent n'a à lire (L49).
const PUBLIC_FIELDS = ["_id", "firstName", "lastName", "email", "role", "departments", "region"];

// L'agent connecté reçoit en plus ce qui décrit son propre compte.
const SELF_FIELDS = [...PUBLIC_FIELDS, "organisationId", "department", "isReferent", "lastLoginAt", "createdAt"];

const pick = (fields) => (agent) => {
  if (!agent) return agent;
  const source = typeof agent.toObject === "function" ? agent.toObject() : agent;
  return fields.reduce((acc, field) => {
    if (source[field] !== undefined) acc[field] = source[field];
    return acc;
  }, {});
};

const serializeAgent = pick(PUBLIC_FIELDS);
const serializeAgentSelf = pick(SELF_FIELDS);

module.exports = { serializeAgent, serializeAgentSelf, PUBLIC_FIELDS, SELF_FIELDS };
