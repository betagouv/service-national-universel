const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const { secret } = require("./config");
const { capture } = require("./sentry");
const Joi = require("joi");

const Young = require("./models/young");
const Referent = require("./models/referent");

function getToken(req) {
  let token = ExtractJwt.fromAuthHeaderWithScheme("JWT")(req);
  if (!token) token = req.cookies.jwt;
  return token;
}

module.exports = function (app) {
  const opts = {};
  opts.jwtFromRequest = getToken;
  opts.secretOrKey = secret;

  passport.use(
    "young",
    new JwtStrategy(opts, async function (jwtPayload, done) {
      try {
        const { error, value } = Joi.object({ _id: Joi.string().required() }).validate({ _id: jwtPayload._id });
        if (error) return done(null, false);

        const young = await Young.findOne({ _id: value._id });
        if (young) return done(null, young);
      } catch (error) {
        capture(error);
      }
      return done(null, false);
    })
  );

  passport.use(
    "referent",
    new JwtStrategy(opts, async function (jwtPayload, done) {
      try {
        const { error, value } = Joi.object({ _id: Joi.string().required() }).validate({ _id: jwtPayload._id });
        if (error) return done(null, false);

        const referent = await Referent.findOne({ _id: value._id });
        if (referent) return done(null, referent);
      } catch (error) {
        capture(error);
      }
      return done(null, false);
    })
  );

  app.use(passport.initialize());
};
