const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const { secret } = require("./config");
const { capture } = require("./sentry");
const Joi = require("joi");

const Young = require("./models/young");
const Referent = require("./models/referent");
const { ROLES } = require("snu-lib");

function getToken(req) {
  let token = ExtractJwt.fromAuthHeaderWithScheme("JWT")(req);
  if (!token) token = req.cookies.jwt;
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
        const { error, value } = Joi.object({ _id: Joi.string().required() }).validate({ _id: jwtPayload._id });
        if (error) return done(null, false);

        const young = await Young.findById(value._id).select("password");
        if (young && jwtPayload.lastLogoutAt === young.lastLogoutAt && jwtPayload.password === young.password) return done(null, young);
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
        const { error, value } = Joi.object({ _id: Joi.string().required() }).validate({ _id: jwtPayload._id });
        if (error) return done(null, false);

        const referent = await Referent.findById(value._id).select("password");
        console.log("🚀 ~ file: passport.js:47 ~ referent:", referent.password);
        if (referent && jwtPayload.lastLogoutAt === referent.lastLogoutAt && jwtPayload.password === referent.password) return done(null, referent);
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
        const { error, value } = Joi.object({ _id: Joi.string().required() }).validate({ _id: jwtPayload._id });
        if (error) return done(null, false);

        const referent = await Referent.findById(value._id).select("password");
        if (referent && referent.role === ROLES.ADMIN && jwtPayload.lastLogoutAt === referent.lastLogoutAt && jwtPayload.password === referent.password)
          return done(null, referent);
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
        const { error, value } = Joi.object({ _id: Joi.string().required() }).validate({ _id: jwtPayload._id });
        if (error) return done(null, false);

        const referent = await Referent.findById(value._id).select("password");
        if (referent && referent.role === ROLES.DSNJ && jwtPayload.lastLogoutAt === referent.lastLogoutAt && jwtPayload.password === referent.password) return done(null, referent);
      } catch (error) {
        capture(error);
      }
      return done(null, false);
    }),
  );
};

module.exports.getToken = getToken;
