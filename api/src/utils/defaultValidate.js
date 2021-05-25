const Joi = require("joi");

function validateString(string){
  return Joi.string().allow(null,'').validate(string, { stripUnknown: true });
}

function validateEmail(mail){
  return Joi.string().allow(null,'').validate(mail, { stripUnknown: true });
}

function validateToken(token){
  return Joi.string().allow(null,'').validate(token, { stripUnknown : true});
}

function validateId(id){
  return Joi.string().allow(null,'').validate(id, { stripUnknown : true});
}

module.exports = {
    validateEmail,
    validateId,
    validateString,
    validateToken
};