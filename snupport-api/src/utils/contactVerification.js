// Un email reçu par un canal non authentifié (formulaire public, IMAP) n'est jamais prouvé : ni
// session, ni SPF/DKIM. Le rattacher silencieusement à la fiche d'un contact déjà connu (référent,
// admin, jeune) permettrait d'usurper son identité par le seul choix de son adresse (PM46, PM48).
// Le contact réel est réutilisé (un seul document par email en base), mais l'appelant est informé
// qu'il s'agit d'une identité non prouvée pour marquer en conséquence le ticket créé.
async function resolveUnverifiedContact({ ContactModel, AgentModel, email, createAttrs = {} }) {
  const normalizedEmail = String(email).toLowerCase();
  let identity = await ContactModel.findOne({ email: normalizedEmail });
  if (!identity && AgentModel) identity = await AgentModel.findOne({ email: normalizedEmail });
  if (identity) return { identity, identityVerified: false };
  identity = await ContactModel.create({ email: normalizedEmail, ...createAttrs });
  return { identity, identityVerified: true };
}

module.exports = { resolveUnverifiedContact };
