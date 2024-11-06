const jwt = require("jsonwebtoken");
const config = require("config");
const { ReferentModel, YoungModel } = require("../models");
const { getToken } = require("../passport");
const { checkJwtSigninVersion } = require("../jwt-options");
const Joi = require("joi");

const optionalAuth = async (req, _, next) => {
  try {
    const token = getToken(req);
    if (token) {
      const jwtPayload = await jwt.verify(token, config.JWT_SECRET);

      // Validate the JWT payload
      const { error, value } = Joi.object({
        __v: Joi.string().required(),
        _id: Joi.string().required(),
        passwordChangedAt: Joi.date().allow(null),
        lastLogoutAt: Joi.date().allow(null),
      }).validate(jwtPayload, { stripUnknown: true });

      if (error || !checkJwtSigninVersion(value)) return;

      const { _id, passwordChangedAt, lastLogoutAt } = value;
      let user = await ReferentModel.findById(_id);

      if (!user) {
        user = await YoungModel.findById(_id);
      }

      if (user) {
        const passwordMatch = passwordChangedAt?.getTime() === user.passwordChangedAt?.getTime();
        const logoutMatch = lastLogoutAt?.getTime() === user.lastLogoutAt?.getTime();

        if (passwordMatch && logoutMatch) {
          req.user = user;
        }
      }
    }
  } catch (e) {
    // Silently handle errors (no action needed)
  }
  next();
};

module.exports = optionalAuth;
