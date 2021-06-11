const Joi = require("joi");

function validateId(id) {
  return Joi.string().validate(id, { stripUnknown: true });
}

module.exports = {
  validateId,
};
