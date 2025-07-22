const express = require("express");
const Joi = require("joi");
const  { apiKeyGuard } = require("../../middlewares/authenticationGuards");
const { validateBody } = require("../../middlewares/validation");
const router = express.Router();
const ContactModel = require("../../models/contact");
const { SCHEMA_EMAIL } = require("../../schemas");

router.use(apiKeyGuard);

router.post("/",
  validateBody(Joi.object({
    contacts: Joi.array().items(Joi.object({
      email: SCHEMA_EMAIL,
      firstName: Joi.string(),
      lastName: Joi.string(),
      attributes: Joi.array().items(Joi.object({
        name: Joi.string(),
        value:  Joi.alternatives().try(Joi.string().allow("", null), Joi.array().items(Joi.string().allow(""))).optional(),
      })),
    }))
  }).prefs({ presence: 'required' })),
  async (req, res) => {
    const contactsSNU = req.cleanBody.contacts;
    for (let contact of contactsSNU) {
      const obj = {};
      const organisation = req.user;
      const flatAttributes = (arr) => arr.map((e) => e.name);
      const filterAttributes = flatAttributes(contact.attributes).map((e) => {
        if (flatAttributes(organisation.attributes).includes(e)) {
          return { name: e, value: contact.attributes.find((att) => att.name === e).value, format: organisation.attributes.find((att) => att.name === e).format };
        }
        return null;
      });

      if (Array.isArray(filterAttributes.find((att) => att.name === "departement").value)) {
        filterAttributes.find((att) => att.name === "departement").value = filterAttributes.find((att) => att.name === "departement").value[0];
      }

      obj.email = contact.email;
      obj.firstName = contact.firstName;
      obj.lastName = contact.lastName;
      obj.attributes = filterAttributes;
      obj.department = filterAttributes.find((attr) => attr.name === "departement" || attr.name === "département" || attr.name === "department")?.value || undefined;
      obj.region = filterAttributes.find((attr) => attr.name === "region" || attr.name === "région")?.value || undefined;
      obj.role = filterAttributes.find((attr) => attr.name === "role" || attr.name === "rôle")?.value || undefined;

      await ContactModel.findOneAndUpdate({ email: obj.email }, obj, { new: true, upsert: true });
    }
    return res.status(200).send({ ok: true });
  }
);

module.exports = router;
