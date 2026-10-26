const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const HeaderAPIKeyStrategy = require("passport-headerapikey").HeaderAPIKeyStrategy;

const OrganisationModel = require("./models/organisation");
const AgentModel = require("./models/agent");

const { config } = require("./config");
const { checkJwtVersion } = require("./jwt-options");
const { validateAgentTokenPayload, isAgentTokenCurrent } = require("./utils/agentToken");
const { capture } = require("./sentry");

// Le cookie `jwtzamoud` est partagé par tous les sous-domaines : seule l'interface agent en a
// besoin. La base de connaissance publique en était déjà exclue (FH16) ; l'admin SNU et moncompte
// ne l'étaient pas, si bien qu'une XSS dans l'un d'eux agissait avec la session de tout agent qui
// les consultait (FM19). Le cookie n'est donc lu que pour l'origine de l'interface agent, ou sans
// origine (navigation de premier niveau, que le navigateur n'étiquette pas).
function isAgentOrigin(origin) {
  return !origin || origin === config.SNUPPORT_URL_ADMIN;
}

function getToken(req) {
  let token = ExtractJwt.fromAuthHeaderWithScheme("jwtzamoud")(req);
  if (!token && isAgentOrigin(req.get("Origin"))) token = req.cookies.jwtzamoud;
  return token;
}

module.exports = function () {
  const opts = {};
  opts.jwtFromRequest = getToken;
  opts.secretOrKey = config.JWT_SECRET;

  passport.use(
    "agent",
    new JwtStrategy(opts, async function (jwtPayload, done) {
      try {
        const { error, value } = validateAgentTokenPayload(jwtPayload);
        if (error) return done(null, false);
        if (!checkJwtVersion(value)) return done(null, false);

        const agent = await AgentModel.findById(value._id);
        // Un jeton émis avant la dernière déconnexion ou le dernier changement de mot de passe est refusé (M98).
        if (agent && isAgentTokenCurrent(agent, value)) return done(null, agent);
      } catch (error) {
        capture(error);
      }
      return done(null, false);
    }),
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
    }),
  );
};

module.exports.getToken = getToken;
