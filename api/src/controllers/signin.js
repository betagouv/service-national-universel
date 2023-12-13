const express = require("express");
const router = express.Router();
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const { ROLES } = require("snu-lib");
const { getToken } = require("../Infrastructure/Services/passport");
const config = require("../Infrastructure/config");
const { serializeYoung, serializeReferent } = require("../utils/serializer");
const { ERRORS } = require("../utils");

const Young = require("../Infrastructure/Databases/Mongo/Models/young");
const Referent = require("../Infrastructure/Databases/Mongo/Models/referent");
const { capture } = require("../Infrastructure/Services/sentry");
const { checkJwtSigninVersion } = require("../Infrastructure/Services/jwt-options");

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

    const jwtPayload = await jwt.verify(token, config.secret);
    const { error, value } = Joi.object({
      __v: Joi.string().required(),
      _id: Joi.string().required(),
      passwordChangedAt: Joi.string(),
      lastLogoutAt: Joi.date(),
    }).validate(jwtPayload, { stripUnknown: true });

    if (error || !checkJwtSigninVersion(value)) return res.status(401).json({ ok: false, user: { restriction: "public" } });
    delete value.__v;

    const young = await Young.findOne(value);
    if (young) {
      young.set({ lastActivityAt: Date.now() });
      await young.save();
      return res.status(200).send({ ok: true, user: { ...serializeYoung(young, young), allowedRole: "young" } });
    }
    const referent = await Referent.findOne(value);
    if (referent) {
      referent.set({ lastActivityAt: Date.now() });
      await referent.save();
      return res.status(200).send({ ok: true, user: { ...serializeReferent(referent, referent), allowedRole: allowedRole(referent) } });
    }
    return res.status(401).send({ ok: false, user: { restriction: "public" } });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, user: null });
  }
});

module.exports = router;
