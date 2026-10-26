const express = require("express");
const router = express.Router();
const OrganisationModel = require("../models/organisation");
const  { agentGuard } = require("../middlewares/authenticationGuards");
const { ERRORS } = require("../errors");
const { validateParams, validateBody, validateQuery, idSchema } = require("../middlewares/validation");
const Joi = require("joi");
const { SCHEMA_EMAIL } = require("../schemas");
const { requireRole } = require("../middlewares/userRoleGuards");
const { serializeOrganisation } = require("../utils/organisation");

router.use(agentGuard);

router.patch("/:id",
  // La configuration de l'organisation (spams, rôles et URL de la base de connaissance) n'est
  // éditable que par les agents du support : c'est déjà le seul rôle auquel le front expose ces
  // écrans, mais rien ne l'imposait côté API — tout agent authentifié, référent SNU synchronisé
  // compris, pouvait la modifier.
  requireRole("AGENT"),
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
    // On ne modifie que sa propre organisation : l'identifiant vient de l'URL, il n'est pas
    // vérifié par l'authentification.
    if (req.cleanParams.id !== String(req.user.organisationId)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    const organisation = await OrganisationModel.findById(req.cleanParams.id);
    if (!organisation) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    organisation.set(req.cleanBody);
    await organisation.save();

    return res.status(200).send({ ok: true, data: serializeOrganisation(organisation) });
  }
);

/*
Routes deleted as not used :
GET /organisation
*/

module.exports = router;
