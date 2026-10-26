// Qui lit la base de connaissance, et avec quels rôles (M86). Voir utils/knowledgeBaseReader.
const passport = require("passport");

const { ERRORS } = require("../errors");
const { canEditKnowledgeBase } = require("../utils/knowledgeBaseScope");
const { PUBLIC_ROLE, getReaderRoles } = require("../utils/knowledgeBaseReader");

// Authentification facultative : un échec laisse simplement le lecteur anonyme.
const authenticateOptionally = (strategy, req, res) =>
  new Promise((resolve) => {
    passport.authenticate(strategy, { session: false }, (error, user) => resolve(!error && user ? user : null))(req, res, () => resolve(null));
  });

/**
 * Renseigne `req.knowledgeBaseReader` :
 * - `isTrusted` : l'API v1 (clé d'API d'organisation) ou un éditeur de la base (agent du support
 *   central) ; ils lisent tous les rôles et tous les statuts ;
 * - `canRead(role)` : `public` pour tous, les autres rôles sur preuve (jeton de lecture ou appelant de confiance).
 */
const resolveKnowledgeBaseReader = async (req, res, next) => {
  const organisation = req.get("apikey") ? await authenticateOptionally("apikey", req, res) : null;
  const agent = organisation ? null : await authenticateOptionally("agent", req, res);
  const isTrusted = Boolean(organisation) || canEditKnowledgeBase(agent);
  const roles = isTrusted ? [] : getReaderRoles(req);

  req.knowledgeBaseReader = {
    isTrusted,
    canRead: (role) => role === PUBLIC_ROLE || isTrusted || roles.includes(role),
  };
  next();
};

/** Refuse la lecture d'un rôle (`:allowedRole`) que le lecteur n'a pas prouvé. */
const requireReadableRole = (req, res, next) => {
  if (!req.knowledgeBaseReader?.canRead(req.cleanParams.allowedRole)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
  next();
};

module.exports = { resolveKnowledgeBaseReader, requireReadableRole };
