const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const { secret, APP_URL, ADMIN_URL, KNOWLEDGEBASE_URL } = require("../config");
const { capture } = require("./sentry");
const Joi = require("joi");

const Young = require("../Databases/Mongo/Models/young");
const Referent = require("../Databases/Mongo/Models/referent");
const { ROLES } = require("snu-lib");
const { checkJwtSigninVersion } = require("./jwt-options");

function getToken(req) {
  let token = ExtractJwt.fromAuthHeaderWithScheme("JWT")(req);

  // * On first call after refresh, the token is only in the cookie
  if (!token) {
    const origin = req.get("Origin");
    if (origin === APP_URL) token = req.cookies.jwt_young;
    else if (origin === ADMIN_URL) token = req.cookies.jwt_ref;
    else if (origin === KNOWLEDGEBASE_URL) {
      token = req.cookies.jwt_ref;
      if (!token) token = req.cookies.jwt_young;
    }
  }
  return token;
}
async function validateUser(Model, jwtPayload, done, role) {
  try {
    const { error, value } = Joi.object({
      __v: Joi.string().required(),
      _id: Joi.string().required(),
      passwordChangedAt: Joi.date().allow(null),
      lastLogoutAt: Joi.date().allow(null),
    }).validate(jwtPayload, { stripUnknown: true });

    if (error) return done(null, false);
    if (!checkJwtSigninVersion(value)) return done(null, false);
    delete value.__v;

    const user = await Model.findOne(value);
    if (user && (!role || user.role === role)) return done(null, user);
  } catch (error) {
    capture(error);
  }
  return done(null, false);
}

module.exports = function () {
  const opts = {};
  opts.jwtFromRequest = getToken;
  opts.secretOrKey = secret;

  passport.use("young", new JwtStrategy(opts, (jwtPayload, done) => validateUser(Young, jwtPayload, done)));
  passport.use("referent", new JwtStrategy(opts, (jwtPayload, done) => validateUser(Referent, jwtPayload, done)));
  passport.use("admin", new JwtStrategy(opts, (jwtPayload, done) => validateUser(Referent, jwtPayload, done, ROLES.ADMIN)));
  passport.use("dsnj", new JwtStrategy(opts, (jwtPayload, done) => validateUser(Referent, jwtPayload, done, ROLES.DSNJ)));
};

module.exports.getToken = getToken;
