// La base de connaissance alimente le site public support.snu.gouv.fr : son écriture est
// réservée au personnel du support central (rôle AGENT). C'est déjà la règle appliquée côté
// interface, où les écrans /knowledge-base ne sont rendus que pour `user.role === "AGENT"`
// (snupport-app/src/app.jsx), mais elle n'était pas appliquée côté API.
// Les référents SNU (REFERENT_DEPARTMENT / REFERENT_REGION), dont les comptes sont
// provisionnés automatiquement depuis la plateforme SNU, et le rôle DG (consultation) ne
// doivent pas pouvoir publier, modifier ou supprimer de contenu.
const KNOWLEDGE_BASE_EDITOR_ROLES = ["AGENT"];

function canEditKnowledgeBase(user) {
  return Boolean(user) && KNOWLEDGE_BASE_EDITOR_ROLES.includes(user.role);
}

module.exports = { KNOWLEDGE_BASE_EDITOR_ROLES, canEditKnowledgeBase };
