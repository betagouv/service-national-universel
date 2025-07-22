const Joi = require("joi");

export const SCHEMA_ID = Joi.string().alphanum().length(24);
export const SCHEMA_EMAIL = Joi.string().email().lowercase();
export const SCHEMA_PATH = Joi.string().pattern(/^[0-9a-zA-Z/.-]+$/);
export const SCHEMA_ROLE = Joi.string().valid("AGENT", "ADMIN", "REFERENT_DEPARTMENT", "REFERENT_REGION", "DG");
export const SCHEMA_PARCOURS = Joi.string().valid("VOLONTAIRE", "CLE");
export const SCHEMA_SOURCE = Joi.string().valid("CHAT", "MAIL", "PLATFORM", "FORM");
export const SCHEMA_TICKET_STATUS = Joi.string().valid("NEW", "OPEN", "CLOSED", "PENDING", "DRAFT");