const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const config = require("config");
const { capture } = require("./sentry");
const Joi = require("joi");

const { YoungModel, ReferentModel } = require("./models");
const { ROLES } = require("snu-lib");
const { checkJwtSigninVersion } = require("./jwt-options");

function getToken(req) {
  let token = ExtractJwt.fromAuthHeaderWithScheme("JWT")(req);

  // * On first call after refresh, the token is only in the cookie
  if (!token) {
    const origin = req.get("Origin");
    if (origin === config.APP_URL) token = req.cookies.jwt_young;
    else if (origin === config.ADMIN_URL) token = req.cookies.jwt_ref;
    else if (origin === config.KNOWLEDGEBASE_URL) {
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

    const user = await Model.findById(value._id);
    if (user) {
      const passwordMatch = user.passwordChangedAt?.getTime() === value.passwordChangedAt?.getTime();
      const logoutMatch = user.lastLogoutAt?.getTime() === value.lastLogoutAt?.getTime();

      if (passwordMatch && logoutMatch && (!role || user.role === role)) {
        return done(null, user);
      }
    }
  } catch (error) {
    capture(error);
  }
  return done(null, false);
}

function initPassport() {
  const opts = {};
  opts.jwtFromRequest = getToken;
  opts.secretOrKey = config.JWT_SECRET;

  passport.use("young", new JwtStrategy(opts, (jwtPayload, done) => validateUser(YoungModel, jwtPayload, done)));
  passport.use("referent", new JwtStrategy(opts, (jwtPayload, done) => validateUser(ReferentModel, jwtPayload, done)));
  passport.use("admin", new JwtStrategy(opts, (jwtPayload, done) => validateUser(ReferentModel, jwtPayload, done, ROLES.ADMIN)));
  passport.use("dsnj", new JwtStrategy(opts, (jwtPayload, done) => validateUser(ReferentModel, jwtPayload, done, ROLES.DSNJ)));
  passport.use("injep", new JwtStrategy(opts, (jwtPayload, done) => validateUser(ReferentModel, jwtPayload, done, ROLES.INJEP)));

}

module.exports = {
  initPassport,
  getToken,
};
