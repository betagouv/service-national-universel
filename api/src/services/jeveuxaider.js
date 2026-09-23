const crypto = require("crypto");
const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const Joi = require("joi");

const { capture } = require("../sentry");
const { logger } = require("../logger");
const { ReferentModel } = require("../models");
const { MissionModel } = require("../models");
const { ApplicationModel } = require("../models");
const { StructureModel } = require("../models");
const { YoungModel } = require("../models");
const { ContractModel } = require("../models");
const { config } = require("../config");
const { ROLES, APPLICATION_STATUS, MISSION_STATUS, CONTRACT_STATUS, YOUNG_STATUS, YOUNG_STATUS_PHASE2, ReferentStatus } = require("snu-lib");
const { JWT_SIGNIN_MAX_AGE_SEC, JWT_SIGNIN_VERSION, JWT_JVA_TOKEN_VERSION, JWT_JVA_TOKEN_TYPE, JWT_JVA_TOKEN_MAX_AGE_SEC } = require("../jwt-options");
const { cookieOptions, COOKIE_SIGNIN_MAX_AGE_MS } = require("../cookie-options");
const { ERRORS, checkStatusContract } = require("../utils");
const { authRateLimiter } = require("../middlewares/rateLimit");

const MINUTE = 60 * 1000;

// Le back de JVA appelle /getToken et /actions pour tous ses responsables depuis quelques IP : seules les
// clés d'API refusées consomment du quota, un email inconnu ne doit pas bloquer l'intégration.
const jvaApiKeyLimiter = authRateLimiter({
  prefix: "jva-api-key",
  windowMs: 15 * MINUTE,
  limit: 20,
  skipSuccessfulRequests: true,
  requestWasSuccessful: (_req, res) => !res.locals.jvaApiKeyRejected,
});
const jvaSigninLimiter = authRateLimiter({ prefix: "jva-signin", windowMs: 15 * MINUTE, limit: 20, skipSuccessfulRequests: true });

const JVA_ROLES = [ROLES.RESPONSIBLE, ROLES.SUPERVISOR];

// Clé d'API de JVA : en-tête `x-api-key`. La query `api_key` reste acceptée le temps que JVA migre ses appels ;
// chaque usage est journalisé pour savoir quand la retirer (elle finit dans les logs des proxys).
function getJvaApiKey(req) {
  const header = req.get("x-api-key");
  if (header) return header;
  if (typeof req.query.api_key === "string" && req.query.api_key) {
    logger.warn(`jeveuxaider: clé d'API reçue en query string sur ${req.path}, à passer en en-tête x-api-key`);
    return req.query.api_key;
  }
  return undefined;
}

// Comparaison en temps constant ; les empreintes ont la même longueur quelle que soit la clé reçue.
function isValidJvaApiKey(apiKey) {
  if (!config.JVA_TOKEN || typeof apiKey !== "string" || !apiKey) return false;
  const digest = (value) => crypto.createHash("sha256").update(value).digest();
  return crypto.timingSafeEqual(digest(apiKey), digest(config.JVA_TOKEN));
}

function requireJvaApiKey(req, res, next) {
  if (!isValidJvaApiKey(getJvaApiKey(req))) {
    res.locals.jvaApiKeyRejected = true;
    return res.status(401).send({ ok: false, code: ERRORS.EMAIL_OR_API_KEY_INVALID });
  }
  next();
}

const isRevokedReferent = (user) => user.status === "DELETED" || user.status === ReferentStatus.INACTIVE;

// Responsable ou superviseur actif d'une structure JVA : seuls comptes que l'intégration peut connecter.
async function findJvaReferentByEmail(email) {
  const user = await ReferentModel.findOne({ email, role: { $in: JVA_ROLES } });
  if (!user || isRevokedReferent(user)) return { user: null, structure: null };
  const structure = await StructureModel.findById(user.structureId);
  return { user, structure };
}

// ! Appelé par le front de JVA
router.get("/signin", jvaSigninLimiter, async (req, res) => {
  try {
    const { error, value } = Joi.object({ token_jva: Joi.string().required() }).validate(req.query, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    let jwtPayload;
    try {
      jwtPayload = await jwt.verify(value.token_jva, config.JWT_SECRET);
    } catch (error) {
      return res.status(401).send({ ok: false, code: ERRORS.PASSWORD_TOKEN_EXPIRED_OR_INVALID });
    }
    // Seul un jeton émis par /getToken s'échange ici : un JWT de session (ou tout autre jeton signé avec le
    // même secret) est refusé.
    const { error: error_token, value: value_token } = Joi.object({
      __v: Joi.string().valid(JWT_JVA_TOKEN_VERSION).required(),
      type: Joi.string().valid(JWT_JVA_TOKEN_TYPE).required(),
      _id: Joi.string().required(),
      passwordChangedAt: Joi.date().allow(null),
      lastLogoutAt: Joi.date().allow(null),
    }).validate(jwtPayload, { stripUnknown: true });
    if (error_token) return res.status(401).send({ ok: false, code: ERRORS.PASSWORD_TOKEN_EXPIRED_OR_INVALID });

    const user = await ReferentModel.findById(value_token._id);
    if (!user || isRevokedReferent(user) || !JVA_ROLES.includes(user.role)) {
      return res.status(401).send({ ok: false, code: ERRORS.PASSWORD_TOKEN_EXPIRED_OR_INVALID });
    }
    // Un changement de mot de passe ou une déconnexion depuis l'émission invalide le jeton, comme une session.
    const passwordMatch = user.passwordChangedAt?.getTime() === value_token.passwordChangedAt?.getTime();
    const logoutMatch = user.lastLogoutAt?.getTime() === value_token.lastLogoutAt?.getTime();
    if (!passwordMatch || !logoutMatch) return res.status(401).send({ ok: false, code: ERRORS.PASSWORD_TOKEN_EXPIRED_OR_INVALID });

    const structure = await StructureModel.findById(user.structureId);

    if (!structure) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    if (structure.isJvaStructure !== "true") return res.status(401).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    // on connecte l'utilisateur, et on le redirige vers la plateforme admin SNU
    user.set({ lastLoginAt: Date.now() });
    await user.save({ fromUser: user });

    const token = jwt.sign({ __v: JWT_SIGNIN_VERSION, _id: user.id, lastLogoutAt: user.lastLogoutAt, passwordChangedAt: user.passwordChangedAt }, config.JWT_SECRET, {
      expiresIn: JWT_SIGNIN_MAX_AGE_SEC,
    });
    res.cookie("jwt_ref", token, cookieOptions(COOKIE_SIGNIN_MAX_AGE_MS));

    return res.redirect(config.ADMIN_URL);
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

// ! Appelé par le back de JVA
router.get("/getToken", jvaApiKeyLimiter, requireJvaApiKey, async (req, res) => {
  try {
    const { error, value } = Joi.object({ email: Joi.string().lowercase().trim().email().required() }).validate(req.query, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    const { user, structure } = await findJvaReferentByEmail(value.email);

    // si l'utilisateur n'existe pas, on bloque
    if (!user) return res.status(401).send({ ok: false, code: ERRORS.EMAIL_OR_API_KEY_INVALID });
    if (!structure) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    if (structure.isJvaStructure !== "true") return res.status(401).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    // Jeton d'échange à usage unique de fait (5 min), qui n'ouvre pas de session par lui-même.
    const token_jva = jwt.sign(
      { __v: JWT_JVA_TOKEN_VERSION, type: JWT_JVA_TOKEN_TYPE, _id: user._id, lastLogoutAt: user.lastLogoutAt, passwordChangedAt: user.passwordChangedAt },
      config.JWT_SECRET,
      { expiresIn: JWT_JVA_TOKEN_MAX_AGE_SEC },
    );

    return res.status(200).send({ ok: true, data: { token_jva } });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

// ! Route appelée uniquement par le back de JVA donc pas de problème d'exposition du token
router.get("/actions", jvaApiKeyLimiter, requireJvaApiKey, async (req, res) => {
  try {
    const { error, value } = Joi.object({ email: Joi.string().lowercase().trim().email().required() }).validate(req.query, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    const { user, structure } = await findJvaReferentByEmail(value.email);

    // si l'utilisateur n'existe pas, on bloque
    if (!user) return res.status(401).send({ ok: false, code: ERRORS.EMAIL_OR_API_KEY_INVALID });
    if (!structure) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    if (structure.isJvaStructure !== "true") return res.status(401).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    // si l'utilisateur existe, on récupère les missions + candidatures qui lui sont liées
    if (user) {
      const data = {
        structure: {},
        actions: {
          applicationWaitingValidation: 0,
          contractToBeSigned: 0,
          contractToBeFilled: 0,
          missionWaitingCorrection: 0,
          volunteerToHost: 0,
          missionInProgress: 0,
        },
      };
      data.structure = { name: structure.name };

      const missions = await MissionModel.find({ tutorId: user._id.toString() });

      for (let mission of missions) {
        if (mission.status === MISSION_STATUS.WAITING_CORRECTION) data.actions.missionWaitingCorrection += 1;

        const applications = await ApplicationModel.find({ missionId: mission._id });
        for (const application of applications) {
          const young = await YoungModel.findById(application.youngId);
          //If young exist and not deleted
          if (young && young.status !== YOUNG_STATUS.DELETED) {
            if (application.status === APPLICATION_STATUS.WAITING_VALIDATION) data.actions.applicationWaitingValidation += 1;
            if (young.statusPhase2 === YOUNG_STATUS_PHASE2.IN_PROGRESS && application.status === APPLICATION_STATUS.VALIDATED) data.actions.missionInProgress += 1;

            //Find contract and check status
            const contract = await ContractModel.findOne({ _id: application.contractId });
            if (contract && application.status === APPLICATION_STATUS.VALIDATED) {
              const statusContract = checkStatusContract(contract);
              if (statusContract === CONTRACT_STATUS.DRAFT) data.actions.contractToBeFilled += 1;
              if (statusContract === CONTRACT_STATUS.SENT && contract.structureManagerStatus === "WAITING_VALIDATION") data.actions.contractToBeSigned += 1;
              if (statusContract === CONTRACT_STATUS.VALIDATED && young.status === YOUNG_STATUS.VALIDATED) data.actions.volunteerToHost += 1;
            } else {
              if (application.status === APPLICATION_STATUS.VALIDATED) data.actions.contractToBeFilled += 1;
            }
          }
        }
      }
      // data.raw = { missions, structure };

      return res.status(200).send({ ok: true, data });
    }
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
