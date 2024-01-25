const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const Joi = require("joi");

const { capture } = require("../sentry");
const ReferentModel = require("../models/referent");
const MissionModel = require("../models/mission");
const ApplicationModel = require("../models/application");
const StructureModel = require("../models/structure");
const YoungModel = require("../models/young");
const ContractModel = require("../models/contract");
const config = require("../config");
const { ROLES, APPLICATION_STATUS, MISSION_STATUS, CONTRACT_STATUS, YOUNG_STATUS, YOUNG_STATUS_PHASE2 } = require("snu-lib");
const { JWT_SIGNIN_MAX_AGE_SEC, checkJwtSigninVersion, JWT_SIGNIN_VERSION } = require("../jwt-options");
const { cookieOptions, COOKIE_SIGNIN_MAX_AGE_MS } = require("../cookie-options");
const { ERRORS, checkStatusContract } = require("../utils");

// ! Appelé par le front de JVA
router.get("/signin", async (req, res) => {
  try {
    const { error, value } = Joi.object({ token_jva: Joi.string().required() }).validate(req.query);
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    const { token_jva } = value;

    const jwtPayload = await jwt.verify(token_jva, config.secret);
    if (!jwtPayload) return res.status(401).send({ ok: false, code: ERRORS.EMAIL_OR_TOKEN_INVALID });
    const { error_token, value_token } = Joi.object({
      __v: Joi.string().required(),
      _id: Joi.string().required(),
      passwordChangedAt: Joi.string(),
      lastLogoutAt: Joi.date(),
    }).validate(jwtPayload, { stripUnknown: true });
    if (error_token || !checkJwtSigninVersion(value_token)) return res.status(401).send({ ok: false, code: ERRORS.EMAIL_OR_TOKEN_INVALID });
    delete value_token.__v;

    const user = await ReferentModel.find(value_token);
    if (!user) return res.status(401).send({ ok: false, code: ERRORS.EMAIL_OR_TOKEN_INVALID });

    const structure = await StructureModel.findById(user.structureId);

    if (!structure) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    if (structure.isJvaStructure !== "true") return res.status(401).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    // si l'utilisateur existe, on le connecte, et on le redirige vers la plateforme admin SNU
    if (user) {
      user.set({ lastLoginAt: Date.now() });
      await user.save();

      const token = jwt.sign({ __v: JWT_SIGNIN_VERSION, _id: user.id, lastLogoutAt: user.lastLogoutAt, passwordChangedAt: user.passwordChangedAt }, config.secret, {
        expiresIn: JWT_SIGNIN_MAX_AGE_SEC,
      });
      res.cookie("jwt_ref", token, cookieOptions(COOKIE_SIGNIN_MAX_AGE_MS));

      return res.redirect(config.ADMIN_URL);
    }
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

// ! Appelé par le back de JVA
router.get("/getToken", async (req, res) => {
  try {
    const { error, value } = Joi.object({ email: Joi.string().lowercase().trim().email().required(), api_key: Joi.string().required() }).validate(req.query);
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    const { api_key, email } = value;

    if (!email || !api_key || api_key.toString() !== config.JVA_TOKEN.toString()) {
      return res.status(401).send({ ok: false, code: ERRORS.EMAIL_OR_API_KEY_INVALID });
    }

    const user = await ReferentModel.findOne({ email, role: { $in: [ROLES.RESPONSIBLE, ROLES.SUPERVISOR] } });

    // si l'utilisateur n'existe pas, on bloque
    if (!user || user.status === "DELETED") return res.status(401).send({ ok: false, code: ERRORS.EMAIL_OR_API_KEY_INVALID });

    const token_jva = jwt.sign({ __v: JWT_SIGNIN_VERSION, _id: user._id, lastLogoutAt: user.lastLogoutAt, passwordChangedAt: user.passwordChangedAt }, config.secret, {
      expiresIn: JWT_SIGNIN_MAX_AGE_SEC,
    });

    return res.status(200).send({ ok: true, data: { token_jva } });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

// ! Route appelée uniquement par le back de JVA donc pas de problème d'exposition du token
router.get("/actions", async (req, res) => {
  try {
    const { error, value } = Joi.object({ email: Joi.string().lowercase().trim().email().required(), api_key: Joi.string().required() }).validate(req.query);
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    const { api_key, email } = value;

    if (!email || !api_key || api_key.toString() !== config.JVA_TOKEN.toString()) {
      return res.status(401).send({ ok: false, code: ERRORS.EMAIL_OR_API_KEY_INVALID });
    }

    const user = await ReferentModel.findOne({ email, role: { $in: [ROLES.RESPONSIBLE, ROLES.SUPERVISOR] } });

    // si l'utilisateur n'existe pas, on bloque
    if (!user || user.status === "DELETED") return res.status(401).send({ ok: false, code: ERRORS.EMAIL_OR_API_KEY_INVALID });

    const structure = await StructureModel.findById(user.structureId);

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
          const young = await YoungModel.findOne({ _id: application.youngId });
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
