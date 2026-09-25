const express = require("express");
const router = express.Router();
const TagModel = require("../models/tag");
const { autocompleteRegex } = require("../utils/searchRegex");
const  { agentGuard } = require("../middlewares/authenticationGuards");
const { requireRole } = require("../middlewares/userRoleGuards");
const { validateParams, validateBody, validateQuery, idSchema } = require("../middlewares/validation");
const Joi = require("joi");

router.use(agentGuard);

router.get("/search",
  validateQuery(Joi.object({
    q: Joi.string().trim().max(128),
  })),
  async (req, res) => {
    let query = { deletedAt: null };
    const q = req.cleanQuery.q || "";
    if (req.user.role === "REFERENT_DEPARTMENT" || req.user.role === "REFERENT_REGION") query.userVisibility = "ALL";
    // Motif échappé et ancré : la saisie brute alimentait un `$regex` (injection NoSQL / ReDoS, L51).
    query.name = { $regex: autocompleteRegex(q), $options: "i" };
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

// Les étiquettes sont partagées par tout le support : leur administration (modification, suppression)
// est réservée aux agents centraux, comme la création. La suppression définitive est retirée au profit
// de la seule suppression logique (soft-delete), qui préserve l'historique des tickets déjà étiquetés.
router.patch("/:id",
  requireRole("AGENT"),
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

router.put("/soft-delete/:id",
  requireRole("AGENT"),
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
