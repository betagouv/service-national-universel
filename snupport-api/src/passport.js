const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const HeaderAPIKeyStrategy = require("passport-headerapikey").HeaderAPIKeyStrategy;
const Joi = require("joi");

const OrganisationModel = require("./models/organisation");
const AgentModel = require("./models/agent");

const { config } = require("./config");
const { checkJwtVersion } = require("./jwt-options");
const { capture } = require("./sentry");

function getToken(req) {
  let token = ExtractJwt.fromAuthHeaderWithScheme("jwtzamoud")(req);
  if (!token) token = req.cookies.jwtzamoud;
  return token;
}

function validateJwtPayload(jwtPayload) {
  const schema = Joi.object({
    __v: Joi.string().required(),
    _id: Joi.string().required(),
  });

  return schema.validate(jwtPayload, { stripUnknown: true });
}

module.exports = function () {
  const opts = {};
  opts.jwtFromRequest = getToken;
  opts.secretOrKey = config.JWT_SECRET;

  passport.use(
    "agent",
    new JwtStrategy(opts, async function (jwtPayload, done) {
      try {
        const { error, value } = validateJwtPayload(jwtPayload);
        if (error) return done(null, false);
        if (!checkJwtVersion(value)) return done(null, false);
        delete value.__v;

        const agent = await AgentModel.findById(value._id);
        if (agent) return done(null, agent);
      } catch (error) {
        capture(error);
      }
      return done(null, false);
    })
  );

  passport.use(
    "apikey",
    new HeaderAPIKeyStrategy({ header: "apikey", prefix: "" }, false, function (apikey, done) {
      OrganisationModel.findOne({ apikey })
        .then((organisation) => {
          if (!organisation) return done(null, false);
          return done(null, organisation);
        })
        .catch((error) => {
          return done(error);
        });
    })
  );
};

module.exports.getToken = getToken;
