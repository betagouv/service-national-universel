const express = require("express");
const router = express.Router();
const TagModel = require("../models/tag");
const { diacriticSensitiveRegex } = require("../utils");
const  { agentGuard } = require("../middlewares/authenticationGuards");
const { requireRole } = require("../middlewares/userRoleGuards");
const { validateParams, validateBody, validateQuery, idSchema } = require("../middlewares/validation");
const Joi = require("joi");

router.use(agentGuard);

router.get("/search",
  validateQuery(Joi.object({
    q: Joi.string().trim(),
  })),
  async (req, res) => {
    let query = { deletedAt: null };
    const q = req.cleanQuery.q || "";
    if (req.user.role === "REFERENT_DEPARTMENT" || req.user.role === "REFERENT_REGION") query.userVisibility = "ALL";
    query.name = { $regex: diacriticSensitiveRegex(q), $options: "-i" };
    const data = await TagModel.find(query).sort({ name: 1 });
    return res.status(200).send({ ok: true, data });
  }
);

router.get("/", async (req, res) => {
  let query = { deletedAt: null };
  if (req.user.role === "REFERENT_DEPARTMENT" || req.user.role === "REFERENT_REGION") query.userVisibility = "ALL";
  const data = await TagModel.find(query);
  return res.status(200).send({ ok: true, data });
});

router.post("/",
  requireRole("AGENT"),
  validateBody(Joi.object({
    name: Joi.string().trim(),
  }).prefs({ presence: 'required' })),
  async (req, res) => {
    await TagModel.create(req.cleanBody);
    return res.status(200).send({ ok: true });
  }
);

router.patch("/:id",
  validateParams(idSchema),
  validateBody(Joi.object({
    name: Joi.string().trim(),
    userVisibility	: Joi.string().valid("ALL", "AGENT", "OLD"),
  }).min(1)),
  async (req, res) => {
    await TagModel.findOneAndUpdate({ _id: req.cleanParams.id }, req.cleanBody);
    return res.status(200).send({ ok: true });
  }
);

router.delete("/:id",
  validateParams(idSchema),
  async (req, res) => {
    await TagModel.findByIdAndDelete(req.cleanParams.id);

    return res.status(200).send({ ok: true });
  }
);

router.put("/soft-delete/:id",
  validateParams(idSchema),
  async (req, res) => {
    const tag = await TagModel.findById(req.cleanParams.id);
    if (!tag) {
      return res.status(404).send({ ok: false, message: "Tag not found" });
    }

    tag.deletedAt = new Date();
    await tag.save();

    return res.status(200).send({ ok: true });
  }
);

module.exports = router;
