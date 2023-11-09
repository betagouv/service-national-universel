const Joi = require("joi");

const validateCustomHeader = (req, res, next) => {
  // Define the schema for the header
  const schema = Joi.object({
    "x-user-timezone": Joi.number().required().default(0),
  });

  const { error } = schema.validate(req.headers, { allowUnknown: true });
  if (error) {
    req.headers["x-user-timezone"] = 0;
  }
  console.log("req.headers", req.headers);
  next();
};
module.exports = validateCustomHeader;
