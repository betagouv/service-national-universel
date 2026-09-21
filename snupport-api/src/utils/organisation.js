// Le document organisation porte deux secrets qui n'ont jamais à sortir de l'API :
// - `apikey`, qui authentifie l'appelant sur toutes les routes /v0/* (dont le SSO agent) ;
// - `imapConfig`, qui contient les identifiants de la boîte mail du support.
// Toute réponse HTTP exposant une organisation doit passer par ce sérialiseur : on liste
// explicitement les champs publics plutôt que de retirer les champs sensibles, pour qu'un
// nouveau secret ajouté au modèle ne fuite pas par défaut.
const PUBLIC_FIELDS = ["_id", "name", "attributes", "spamEmails", "knowledgeBaseBaseUrl", "knowledgeBaseRoles"];

function serializeOrganisation(organisation) {
  if (!organisation) return organisation;
  const source = typeof organisation.toObject === "function" ? organisation.toObject() : organisation;
  return PUBLIC_FIELDS.reduce((acc, field) => {
    if (source[field] !== undefined) acc[field] = source[field];
    return acc;
  }, {});
}

module.exports = { serializeOrganisation, PUBLIC_FIELDS };
