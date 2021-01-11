const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const { secret } = require("./config");
const { capture } = require("./sentry");

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
        const young = await Young.findOne({ _id: jwtPayload._id });
        if (young) return done(null, young);
      } catch (error) {
        capture(error);
      }
      return done(null, false);
    })
  );

  //TODO : change admin & user => referent
  passport.use(
    "referent",
    new JwtStrategy(opts, async function (jwtPayload, done) {
      try {
        const referent = await Referent.findOne({ _id: jwtPayload._id });
        if (referent) return done(null, referent);
      } catch (error) {
        capture(error);
      }
      return done(null, false);
    })
  );

  // passport.use(
  //   "admin",
  //   new JwtStrategy(opts, async function (jwtPayload, done) {
  //     try {
  //       const referent = await Referent.findOne({ _id: jwtPayload._id });
  //       if (referent.role === "admin") return done(null, referent);
  //       return done(null, false);
  //     } catch (error) {
  //       capture(error);
  //     }
  //     return done(null, false);
  //   })
  // );

  app.use(passport.initialize());
};
