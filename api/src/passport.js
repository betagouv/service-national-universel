const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const { secret, APP_URL, ADMIN_URL, KNOWLEDGEBASE_URL } = require("./config");
const { capture } = require("./sentry");
const Joi = require("joi");

const Young = require("./models/young");
const Referent = require("./models/referent");
const { ROLES } = require("snu-lib");

function getToken(req) {
  let token = ExtractJwt.fromAuthHeaderWithScheme("JWT")(req) ?? req.query.token;

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

module.exports = function () {
  const opts = {};
  opts.jwtFromRequest = getToken;
  opts.secretOrKey = secret;

  passport.use(
    "young",
    new JwtStrategy(opts, async function (jwtPayload, done) {
      try {
        const { error, value } = Joi.object({ _id: Joi.string().required(), passwordChangedAt: Joi.date().allow(null), lastLogoutAt: Joi.date().allow(null) }).validate({
          _id: jwtPayload._id,
          passwordChangedAt: jwtPayload.passwordChangedAt,
          lastLogoutAt: jwtPayload.lastLogoutAt,
        });
        if (error) return done(null, false);

        const young = await Young.findOne(value);
        if (young) return done(null, young);
      } catch (error) {
        capture(error);
      }
      return done(null, false);
    }),
  );

  passport.use(
    "referent",
    new JwtStrategy(opts, async function (jwtPayload, done) {
      try {
        const { error, value } = Joi.object({ _id: Joi.string().required(), passwordChangedAt: Joi.date().allow(null), lastLogoutAt: Joi.date().allow(null) }).validate({
          _id: jwtPayload._id,
          passwordChangedAt: jwtPayload.passwordChangedAt,
          lastLogoutAt: jwtPayload.lastLogoutAt,
        });
        if (error) return done(null, false);

        const referent = await Referent.findOne(value);
        if (referent) return done(null, referent);
      } catch (error) {
        capture(error);
      }
      return done(null, false);
    }),
  );

  passport.use(
    "admin",
    new JwtStrategy(opts, async function (jwtPayload, done) {
      try {
        const { error, value } = Joi.object({ _id: Joi.string().required(), passwordChangedAt: Joi.date().allow(null), lastLogoutAt: Joi.date().allow(null) }).validate({
          _id: jwtPayload._id,
          passwordChangedAt: jwtPayload.passwordChangedAt,
          lastLogoutAt: jwtPayload.lastLogoutAt,
        });
        if (error) return done(null, false);

        const referent = await Referent.findOne(value);
        if (referent && referent.role === ROLES.ADMIN) return done(null, referent);
      } catch (error) {
        capture(error);
      }
      return done(null, false);
    }),
  );

  passport.use(
    "dsnj",
    new JwtStrategy(opts, async function (jwtPayload, done) {
      try {
        const { error, value } = Joi.object({ _id: Joi.string().required(), passwordChangedAt: Joi.date().allow(null), lastLogoutAt: Joi.date().allow(null) }).validate({
          _id: jwtPayload._id,
          passwordChangedAt: jwtPayload.passwordChangedAt,
          lastLogoutAt: jwtPayload.lastLogoutAt,
        });
        if (error) return done(null, false);

        const referent = await Referent.findOne(value);
        if (referent && referent.role === ROLES.DSNJ) return done(null, referent);
      } catch (error) {
        capture(error);
      }
      return done(null, false);
    }),
  );
};

module.exports.getToken = getToken;
