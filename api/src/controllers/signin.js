const express = require("express");
const router = express.Router();
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const { ROLES } = require("snu-lib");
const { getToken } = require("../passport");
const { config } = require("../config");
const { cookieOptions } = require("../cookie-options");
const { ERRORS } = require("../utils");

const { YoungModel, ReferentModel } = require("../models");
const { capture } = require("../sentry");
const { checkJwtSigninVersion } = require("../jwt-options");
const { knowledgeBaseReadableRoles, requestKnowledgeBaseReaderToken } = require("../services/knowledgeBaseReader");

const allowedRole = (user) => {
  switch (user?.role) {
    case ROLES.ADMIN:
      return "admin";
    case ROLES.REFERENT_DEPARTMENT:
    case ROLES.REFERENT_REGION:
      return "referent";
    case ROLES.RESPONSIBLE:
    case ROLES.SUPERVISOR:
      return "structure";
    case ROLES.HEAD_CENTER:
      return "head_center";
    case ROLES.HEAD_CENTER_ADJOINT:
      return "head_center_adjoint";
    case ROLES.REFERENT_SANITAIRE:
      return "referent_sanitaire";
    case ROLES.ADMINISTRATEUR_CLE:
      return "administrateur_cle";
    case ROLES.REFERENT_CLASSE:
      return "referent_classe";
    default:
      return "public";
  }
};

// La base de connaissance publique (support.snu.gouv.fr) n'a plus accès à la session sur le reste
// de l'API : passport.getToken ignore les cookies depuis son origine (FH16). Ces deux routes sont
// les seules à les lire pour elle, et n'exposent que ce que son interface affiche.
const getSessionToken = (req) => {
  const token = getToken(req);
  if (token) return token;
  if (req.get("Origin") !== config.KNOWLEDGEBASE_URL) return null;
  return req.cookies.jwt_ref || req.cookies.jwt_young || null;
};

// Un compte supprimé ou anonymisé ne doit plus rendre de session, même avec un jeton encore
// valide : passport.ts applique déjà ce contrôle (L21 de l'audit du 21/09/2026).
const isRevoked = (account) => account.status === "DELETED" || account.anonymized === "true" || account.anonymized === true || Boolean(account.deletedAt);

/** Renvoie le compte porté par le jeton de session, ou null s'il est absent, invalide ou révoqué. */
async function getSessionUser(req) {
  const token = getSessionToken(req);
  if (!token) return null;

  let jwtPayload;
  try {
    jwtPayload = await jwt.verify(token, config.JWT_SECRET);
  } catch (error) {
    return null;
  }

  const { error, value } = Joi.object({
    __v: Joi.string().required(),
    _id: Joi.string().required(),
    _impersonateId: Joi.string().allow(null),
    passwordChangedAt: Joi.date().allow(null),
    lastLogoutAt: Joi.date().allow(null),
  }).validate(jwtPayload, { stripUnknown: true });
  if (error || !checkJwtSigninVersion(value)) return null;

  const { _id, passwordChangedAt, lastLogoutAt } = value;
  const isSessionOf = (account) => passwordChangedAt?.getTime() === account.passwordChangedAt?.getTime() && lastLogoutAt?.getTime() === account.lastLogoutAt?.getTime();

  const young = await YoungModel.findById(_id);
  if (young) return !isRevoked(young) && isSessionOf(young) ? { user: young, isYoung: true } : null;

  const referent = await ReferentModel.findById(_id);
  if (referent) return !isRevoked(referent) && isSessionOf(referent) ? { user: referent, isYoung: false } : null;

  return null;
}

// Ce que la base de connaissance affiche : le rôle (articles visibles, « voir en tant que ») et les
// initiales de l'avatar. Le profil complet (santé, représentants légaux d'un jeune) n'a rien à y
// faire et restait en sessionStorage via le cache SWR (FL9).
const serializeKnowledgeBaseSession = (user, isYoungAccount) => ({
  role: user.role,
  subRole: user.subRole,
  source: user.source,
  initials: `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase(),
  allowedRole: isYoungAccount ? "young" : allowedRole(user),
});

router.get("/token", async (req, res) => {
  try {
    const session = await getSessionUser(req);
    if (!session) return res.status(401).send({ ok: false, user: { restriction: "public" } });

    const { user, isYoung } = session;
    user.set({ lastActivityAt: Date.now() });
    await user.save({ fromUser: req.user });
    // Preuve des rôles lisibles, à présenter à snupport-api pour les articles non publics (M86).
    const knowledgeBaseToken = await requestKnowledgeBaseReaderToken(knowledgeBaseReadableRoles(user, isYoung));
    return res.status(200).send({ ok: true, user: serializeKnowledgeBaseSession(user, isYoung), knowledgeBaseToken });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, user: null });
  }
});

// Déconnexion depuis la base de connaissance : /referent/logout et /young/logout passent par
// passport, qui n'accepte plus le cookie depuis son origine.
router.post("/logout", async (req, res) => {
  try {
    const session = await getSessionUser(req);
    if (!session) return res.status(401).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const { user, isYoung } = session;
    user.set({ lastLogoutAt: Date.now() });
    await user.save({ fromUser: req.user });
    res.clearCookie(isYoung ? "jwt_young" : "jwt_ref", cookieOptions());
    return res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
