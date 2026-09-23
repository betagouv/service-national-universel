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

// Origines de la base de connaissance publique : elles restent autorisées par le CORS (lecture
// des articles) mais n'ont jamais besoin de la session agent. Sans ce refus, une XSS sur
// support.snu.gouv.fr agirait avec le cookie `jwtzamoud` de tout agent qui la consulte (FH16).
// Une origine partagée avec l'interface agent n'est jamais exclue, sous peine de couper la connexion.
const KNOWLEDGE_BASE_ORIGINS = [config.SNUPPORT_URL_KB, config.KNOWLEDGE_BASE_PUBLIC_URL].filter((origin) => origin && origin !== config.SNUPPORT_URL_ADMIN);

function getToken(req) {
  let token = ExtractJwt.fromAuthHeaderWithScheme("jwtzamoud")(req);
  if (!token && !KNOWLEDGE_BASE_ORIGINS.includes(req.get("Origin"))) token = req.cookies.jwtzamoud;
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
