const express = require("express");
const router = express.Router();
const TemplateModel = require("../models/template");
const  { agentGuard } = require("../middlewares/authenticationGuards");
const { ERRORS } = require("../errors");
const { validateParams, validateBody, validateQuery, idSchema } = require("../middlewares/validation");
const Joi = require("joi");
const { SCHEMA_ID } = require("../schemas");

router.use(agentGuard);

router.post("/", 
  validateBody(Joi.object({
    name: Joi.string().trim(),
    description: Joi.string().trim(),
    message: Joi.string(),
    subject: Joi.string().trim(),
    canal: Joi.string().valid("MAIL", "PLATFORM"),
    tags: Joi.array().items(SCHEMA_ID).optional(),
    attributedTo: SCHEMA_ID.optional(),
  }).prefs({ presence: 'required' })),
  async (req, res) => {
    await TemplateModel.create({ ...req.cleanBody, createdBy: req.user._id });
    return res.status(200).send({ ok: true });
  }
);

router.patch("/:id",
  validateParams(idSchema),
  validateBody(Joi.object({
    name: Joi.string().trim(),
    description: Joi.string().trim(),
    message: Joi.string(),
    subject: Joi.string().trim(),
    canal: Joi.string().valid("MAIL", "PLATFORM"),
    tags: Joi.array().items(SCHEMA_ID),
    attributedTo: SCHEMA_ID,
  }).min(1)),
  async (req, res) => {
    const template = await TemplateModel.findById(req.cleanParams.id);
    if (!template) {
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }

    template.set({ ...req.cleanBody, updatedAt: new Date() });
    await template.save();

    return res.status(200).send({ ok: true });
  }
);

router.delete("/:id",
  validateParams(idSchema),
  async (req, res) => {
    await TemplateModel.findOneAndDelete({ _id: req.cleanParams.id });
    return res.status(200).send({ ok: true });
  }
);

router.get("/",
  async (req, res) => {
    const templates = await TemplateModel.find({}).populate(["createdBy", "tags", "attributedTo"]);
    return res.status(200).send({ ok: true, data: templates });
  }
);

module.exports = router;
