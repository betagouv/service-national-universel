const express = require("express");
const router = express.Router();
const Joi = require("joi");
const { capture } = require("../../sentry");
const { ERRORS } = require("../../utils");
const { apiEducation } = require("../../services/gouv.fr/api-education");

router.get("/", async (req, res) => {
  try {
    const { error, value } = Joi.object({
      uai: Joi.string().optional(),
      name: Joi.string().optional(),
      city: Joi.string().optional(),
      type: Joi.array()
        .items(Joi.string().valid("LYC", "COL", "EREA"))
        .optional()
        .default([]),
      page: Joi.number().default(0),
      size: Joi.number().default(20),
    }).validate(req.query, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const filters = [];
    if (value.uai) filters.push({ key: "uai", value: value.uai });
    if (value.name) filters.push({ key: "name", value: value.name });
    if (value.city) filters.push({ key: "city", value: value.city });
    if (value.type) filters.push({ key: "type", value: value.type });

    const data = await apiEducation({ filters, page: value.page, size: value.size });
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
