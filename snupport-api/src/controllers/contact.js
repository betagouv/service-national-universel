const express = require("express");
const router = express.Router();
const Joi = require("joi");
const ContactModel = require("../models/contact");
const AgentModel = require("../models/agent");
const { diacriticSensitiveRegex } = require("../utils");
const  { agentGuard } = require("../middlewares/authenticationGuards");
const { validateParams, validateBody, validateQuery, idSchema } = require("../middlewares/validation");
const { ERRORS } = require("../errors");
const { SCHEMA_EMAIL } = require("../schemas");
const escapeStringRegexp = require("escape-string-regexp");


function autocomplete_regex(query) {
  const pattern = diacriticSensitiveRegex(escapeStringRegexp(query));
  return `^${pattern}.*$`;
}

const SCHEMA_FIRSTNAME = Joi.string().trim();
const SCHEMA_LASTNAME = Joi.string().trim();

router.use(agentGuard);

router.get("/search",
  validateQuery(Joi.object({
    q: Joi.string().trim(),
  }).prefs({ presence: 'required' })),
  async (req, res) => {
    if (req.cleanQuery.q.length < 3) {
      res.status(200).send({
        ok: true,
        data: [],
      });
      return
    }
    const regex = {
      $regex: autocomplete_regex(req.cleanQuery.q),
      $options: 'i',
    }
    const query = {
      $or:  [
        { firstName: regex },
        { lastName: regex },
        { email: regex }
      ]
    };
    if (req.user.role === "REFERENT_DEPARTMENT") {
      query.role = { $in: ["young", "responsible", "supervisor"] };
      query.department = { $in: req.user.departments };
    } else if (req.user.role === "REFERENT_REGION") {
      query.role = { $in: ["young", "responsible", "supervisor"] };
      query.region = req.user.region;
    }
    const contacts = await ContactModel.find(query).limit(6);
    res.status(200).send({
      ok: true,
      data: contacts,
    });
  }
);

router.get("/:id",
  validateParams(idSchema),
  async (req, res) => {
    const id = req.cleanParams.id;
    let data = await ContactModel.findById(id);
    if (!data) data = await AgentModel.findById(id);
    if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    return res.status(200).send({ ok: true, data });
  }
);

// WARNING check if exist, if no create it, does not send error if already exists but return the contact
router.post("/",
  validateBody(Joi.object({
      email: SCHEMA_EMAIL,
      firstName: SCHEMA_FIRSTNAME,
      lastName: SCHEMA_LASTNAME,
    }).prefs({ presence: 'required' })),
  async (req, res) => {
    let contact = await ContactModel.findOne({ email: req.cleanBody.email });
    if (!contact) contact = await AgentModel.findOne({ email: req.cleanBody.email });
    if (!contact)
      contact = await ContactModel.create(req.cleanBody);
    if (!contact) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    return res.status(200).send({ ok: true });
  }
);

module.exports = router;
