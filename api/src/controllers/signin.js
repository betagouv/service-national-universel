const express = require("express");
const router = express.Router();
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const { ROLES } = require("snu-lib");
const { getToken } = require("../passport");
const config = require("config");
const { serializeYoung, serializeReferent } = require("../utils/serializer");
const { ERRORS } = require("../utils");

const { YoungModel, ReferentModel } = require("../models");
const { capture } = require("../sentry");
const { checkJwtSigninVersion } = require("../jwt-options");

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
    case ROLES.ADMIN_CLE:
      return "administrateur_cle";
    case ROLES.REFERENT_CLASSE:
      return "referent_classe";
    default:
      return "public";
  }
};

router.get("/token", async (req, res) => {
  try {
    const token = getToken(req);
    if (!token) return res.status(401).send({ ok: false, user: { restriction: "public" } });

    let jwtPayload;
    try {
      jwtPayload = await jwt.verify(token, config.JWT_SECRET);
    } catch (error) {
      return res.status(401).send({ ok: false, user: { restriction: "public" } });
    }

    const { error, value } = Joi.object({
      __v: Joi.string().required(),
      _id: Joi.string().required(),
      passwordChangedAt: Joi.date().allow(null),
      lastLogoutAt: Joi.date().allow(null),
    }).validate(jwtPayload, { stripUnknown: true });

    if (error || !checkJwtSigninVersion(value)) {
      return res.status(401).json({ ok: false, user: { restriction: "public" } });
    }

    const { _id, passwordChangedAt, lastLogoutAt } = value;

    // First, check in the YoungModel
    let user = await YoungModel.findById(_id);
    if (user) {
      if (passwordChangedAt?.getTime() === user.passwordChangedAt?.getTime() && lastLogoutAt?.getTime() === user.lastLogoutAt?.getTime()) {
        user.set({ lastActivityAt: Date.now() });
        await user.save();
        return res.status(200).send({ ok: true, user: { ...serializeYoung(user, user), allowedRole: "young" } });
      }
    }

    // If not found in YoungModel, check in ReferentModel
    user = await ReferentModel.findById(_id);
    if (user) {
      if (passwordChangedAt?.getTime() === user.passwordChangedAt?.getTime() && lastLogoutAt?.getTime() === user.lastLogoutAt?.getTime()) {
        user.set({ lastActivityAt: Date.now() });
        await user.save();
        return res.status(200).send({ ok: true, user: { ...serializeReferent(user, user), allowedRole: allowedRole(user) } });
      }
    }

    return res.status(401).send({ ok: false, user: { restriction: "public" } });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, user: null });
  }
});

module.exports = router;
