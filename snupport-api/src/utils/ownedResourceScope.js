// Périmètre commun aux objets d'administration du support qui portent un propriétaire par rôle et
// territoire : dossiers de tickets (folder) et règles de ventilation (ventilation). Ces objets ont
// tous `userRole` (AGENT | REFERENT_DEPARTMENT | REFERENT_REGION) et, pour les référents,
// `userDepartment` / `userRegion`.
//
// AGENT et DG sont le personnel central du support, sans périmètre géographique ; les référents
// (REFERENT_DEPARTMENT, REFERENT_REGION) sont provisionnés en masse par le cron `syncReferentSupport`
// et ne doivent agir que sur leurs propres objets. Avant ce garde-fou, tout agent authentifié —
// référent SNU compris — pouvait modifier, réordonner ou supprimer n'importe quel objet, y compris
// les objets centraux partagés par tout le support.
//
// La règle échoue fermée : un rôle inconnu, ou un objet dont le rôle ne correspond pas à celui de
// l'appelant, n'est jamais administrable. Le même schéma que `canManageShortcut` (shortcutScope.js).
const canManageOwnedResource = (user, resource) => {
  if (!user || !resource) return false;
  // On n'administre que les objets de son propre rôle : un référent ne touche pas un objet AGENT.
  if (resource.userRole !== user.role) return false;
  if (user.role === "AGENT") return true;
  if (user.role === "REFERENT_REGION") return !!resource.userRegion && resource.userRegion === user.region;
  if (user.role === "REFERENT_DEPARTMENT") {
    // Historiquement la création ne renseignait pas toujours `userDepartment` pour ce rôle : un objet
    // sans département reste administrable par les référents départementaux, jamais par un autre rôle.
    if (!resource.userDepartment) return true;
    return Array.isArray(user.departments) && user.departments.includes(resource.userDepartment);
  }
  return false;
};

// Filtre Mongo « mes objets » pour les endpoints de liste, aligné sur `canManageOwnedResource`.
const scopeOwnedResourceQuery = (user, baseQuery = {}) => {
  const query = { ...baseQuery, userRole: user.role };
  if (user.role === "REFERENT_DEPARTMENT") query.userDepartment = { $in: user.departments || [] };
  if (user.role === "REFERENT_REGION") query.userRegion = user.region;
  return query;
};

module.exports = { canManageOwnedResource, scopeOwnedResourceQuery };
