// Périmètre des modules de texte et signatures. Les signatures s'insèrent dans l'éditeur des agents
// nationaux : un référent ne doit ni modifier un module d'agent, ni voir sa propre signature servie à
// un agent (FH12, GOO-6).

/** Un compte ne modifie ou ne supprime que les modules de son rôle et, pour un référent, de son territoire. */
const canManageShortcut = (user, shortcut) => {
  if (!user || !shortcut) return false;
  if (shortcut.userRole !== user.role) return false;
  if (user.role === "AGENT") return true;
  if (user.role === "REFERENT_REGION") return !!shortcut.userRegion && shortcut.userRegion === user.region;
  if (user.role === "REFERENT_DEPARTMENT") {
    // La création n'a jamais renseigné userDepartment pour ce rôle : un module sans département reste
    // modifiable par les référents départementaux, jamais par un autre rôle.
    if (!shortcut.userDepartment) return true;
    return Array.isArray(user.departments) && user.departments.includes(shortcut.userDepartment);
  }
  return false;
};

/** Signature automatique à insérer pour un groupe de contacts : jamais celle d'un autre rôle ou territoire. */
const buildSignatureQuery = (user, signatureDest) => {
  const query = { isSignature: true };
  if (signatureDest) query.dest = { $in: [signatureDest] };
  if (user.role === "REFERENT_REGION") {
    query.$or = [{ userRole: "AGENT" }, { userRole: user.role, userRegion: user.region }];
  } else if (user.role === "REFERENT_DEPARTMENT") {
    query.$or = [{ userRole: "AGENT" }, { userRole: user.role, userDepartment: { $in: user.departments || [] } }];
  } else {
    query.userRole = "AGENT";
  }
  return query;
};

module.exports = { canManageShortcut, buildSignatureQuery };
