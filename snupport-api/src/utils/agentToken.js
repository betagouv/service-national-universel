const jwt = require("jsonwebtoken");
const Joi = require("joi");

const { config } = require("../config");
const { JWT_MAX_AGE, JWT_VERSION } = require("../jwt-options");

// Le jeton de session agent porte les dates de dernière déconnexion et de dernier changement de mot de
// passe connues à sa signature. Une déconnexion ou un nouveau mot de passe les fait avancer en base : les
// jetons émis avant, y compris un jeton volé, cessent d'être acceptés au lieu de rester valides jusqu'à
// leur expiration (M98). Même mécanisme que l'API v1 (`api/src/passport.ts`).
function signAgentToken(agent) {
  return jwt.sign(
    {
      __v: JWT_VERSION,
      _id: agent._id,
      lastLogoutAt: agent.lastLogoutAt ?? null,
      passwordChangedAt: agent.passwordChangedAt ?? null,
    },
    config.JWT_SECRET,
    { expiresIn: JWT_MAX_AGE },
  );
}

function validateAgentTokenPayload(jwtPayload) {
  const schema = Joi.object({
    __v: Joi.string().required(),
    _id: Joi.string().required(),
    lastLogoutAt: Joi.date().allow(null).required(),
    passwordChangedAt: Joi.date().allow(null).required(),
  });

  return schema.validate(jwtPayload, { stripUnknown: true });
}

const sameInstant = (a, b) => (a ? new Date(a).getTime() : null) === (b ? new Date(b).getTime() : null);

function isAgentTokenCurrent(agent, payload) {
  return sameInstant(agent.lastLogoutAt, payload.lastLogoutAt) && sameInstant(agent.passwordChangedAt, payload.passwordChangedAt);
}

module.exports = { signAgentToken, validateAgentTokenPayload, isAgentTokenCurrent };
