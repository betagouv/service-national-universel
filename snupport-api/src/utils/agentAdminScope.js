// Hiérarchie d'administration des comptes agents.
//
// AGENT et DG sont le personnel central du support, sans périmètre géographique
// (cf. ticketScope.js) ; REFERENT_DEPARTMENT et REFERENT_REGION sont provisionnés en masse
// par la synchronisation POST /v0/referent (cron `syncReferentSupport`).
//
// Les routes d'administration (POST /agent, PATCH /agent/:id, DELETE /agent/:id) ne
// comparaient que `req.user.role !== "AGENT"` : aucune notion de hiérarchie, donc un AGENT
// pouvait créer un compte de rôle arbitraire et agir sur un compte d'une autre organisation.
//
// Un rôle absent de cette table a le rang 0 : il ne peut rien administrer, et on ne peut
// pas le lui assigner. C'est ce qui neutralise le rôle ADMIN supprimé, au cas où des
// documents historiques le porteraient encore.
const ROLE_RANKS = {
  AGENT: 2,
  DG: 1,
  REFERENT_REGION: 1,
  REFERENT_DEPARTMENT: 1,
};

// Rang le plus bas à partir duquel on administre les comptes agents.
const ADMINISTRATION_RANK = ROLE_RANKS.AGENT;

function roleRank(role) {
  return ROLE_RANKS[role] || 0;
}

function canAdministerAgents(user) {
  return roleRank(user && user.role) >= ADMINISTRATION_RANK;
}

// On ne crée pas un compte plus puissant que le sien.
function canAssignRole(user, role) {
  if (!canAdministerAgents(user)) return false;
  const rank = roleRank(role);
  return rank > 0 && rank <= roleRank(user.role);
}

// On n'agit ni sur un compte d'une autre organisation, ni sur un compte dont le rôle
// domine le sien.
function canManageAgent(user, target) {
  if (!canAdministerAgents(user) || !target) return false;
  if (String(user.organisationId) !== String(target.organisationId)) return false;
  return roleRank(target.role) <= roleRank(user.role);
}

module.exports = { ROLE_RANKS, canAdministerAgents, canAssignRole, canManageAgent };
