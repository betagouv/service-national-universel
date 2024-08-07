const jwt = require("jsonwebtoken");
const config = require("config");
const { ReferentModel, YoungModel } = require("../models");
const { getToken } = require("../passport");
const { checkJwtSigninVersion } = require("../jwt-options");
const Joi = require("joi");

const optionalAuth = async (req, _, next) => {
  try {
    const token = getToken(req);
    let user;
    if (token) {
      const jwtPayload = await jwt.verify(token, config.JWT_SECRET);
      const { error, value } = Joi.object({ __v: Joi.string().required(), _id: Joi.string().required(), passwordChangedAt: Joi.string(), lastLogoutAt: Joi.date() }).validate({
        ...jwtPayload,
      });
      if (error || !checkJwtSigninVersion(value)) return;
      delete value.__v;

      user = await ReferentModel.findOne(value);
      if (!user) {
        user = await YoungModel.findOne(value);
      }
      if (user) {
        req.user = user;
      }
    }
  } catch (e) {
    /* empty */
  }
  next();
};

module.exports = optionalAuth;
