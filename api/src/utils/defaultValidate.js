const Joi = require("joi");

function validateId(id) {
  return Joi.string().validate(id, { stripUnknown: true });
}

function validateString(string) {
  return Joi.string().validate(string, { stripUnknown: true });
}

module.exports = {
  validateId,
  validateString,
};
