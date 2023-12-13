const jwt = require("jsonwebtoken");
const config = require("../Config/config");
const ReferentObject = require("../Databases/Mongo/Models/referent");
const YoungObject = require("../Databases/Mongo/Models/young");
const { getToken } = require("../Services/passport");
const { checkJwtSigninVersion } = require("../Services/jwt-options");
const Joi = require("joi");

const optionalAuth = async (req, _, next) => {
  try {
    const token = getToken(req);
    let user;
    if (token) {
      const jwtPayload = await jwt.verify(token, config.secret);
      const { error, value } = Joi.object({ __v: Joi.string().required(), _id: Joi.string().required(), passwordChangedAt: Joi.string(), lastLogoutAt: Joi.date() }).validate({
        ...jwtPayload,
      });
      if (error || !checkJwtSigninVersion(value)) return;
      delete value.__v;

      user = await ReferentObject.findOne(value);
      if (!user) {
        user = await YoungObject.findOne(value);
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
