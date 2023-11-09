const Joi = require("joi");

const validateCustomHeader = (req, res, next) => {
  // Define the schema for the header
  const schema = Joi.object({
    "x-user-timezone": Joi.number().required(),
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
