const Joi = require("joi");
const { MAX_TIMEZONE_OFFSET_MINUTES } = require("snu-lib");

const validateCustomHeader = (req, res, next) => {
  // Define the schema for the header
  // Le décalage est borné à celui d'un fuseau réel : au-delà, il servait à déplacer « maintenant »
  // de plusieurs jours pour rouvrir des fenêtres d'inscription fermées (M100, audit du 21/09/2026).
  const schema = Joi.object({
    "x-user-timezone": Joi.number().min(-MAX_TIMEZONE_OFFSET_MINUTES).max(MAX_TIMEZONE_OFFSET_MINUTES).required(),
  });

  const { error } = schema.validate(req.headers, { allowUnknown: true });
  if (error) {
    if (error.details[0].context.key === "x-user-timezone") {
      req.headers["x-user-timezone"] = 0;
    }
  }
  next();
};
module.exports = validateCustomHeader;
