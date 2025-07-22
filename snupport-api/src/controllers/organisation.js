const express = require("express");
const router = express.Router();
const OrganisationModel = require("../models/organisation");
const  { agentGuard } = require("../middlewares/authenticationGuards");
const { ERRORS } = require("../errors");
const { validateParams, validateBody, validateQuery, idSchema } = require("../middlewares/validation");
const Joi = require("joi");
const { SCHEMA_EMAIL } = require("../schemas");

router.use(agentGuard);

router.patch("/:id",
  validateParams(idSchema),
  validateBody(Joi.object({
    knowledgeBaseRoles: Joi.array().items(Joi.string().token()),
    knowledgeBaseBaseUrl: Joi.string().uri(),
    attributes: Joi.array().items(Joi.object({
      name: Joi.string().trim(),
      format: Joi.string().valid("link", "date", "string"),
    })),
    spamEmails: Joi.array().items(SCHEMA_EMAIL),
  }).min(1)),
  async (req, res) => {
    const organisation = await OrganisationModel.findById(req.cleanParams.id);
    if (!organisation) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    organisation.set(req.cleanBody);
    await organisation.save();

    return res.status(200).send({ ok: true, data: organisation });
  }
);

/*
Routes deleted as not used :
GET /organisation
*/

module.exports = router;
