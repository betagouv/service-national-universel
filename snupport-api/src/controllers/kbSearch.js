const express = require("express");
const router = express.Router();
const Joi = require("joi");
const KbSearchModel = require("../models/kbSearch");
const { autocompleteRegex } = require("../utils/searchRegex");
const  { agentGuard } = require("../middlewares/authenticationGuards");
const { requireRole } = require("../middlewares/userRoleGuards");
const { validateBody } = require("../middlewares/validation");

router.use(agentGuard);
// Historique des recherches internes de la base de connaissance : réservé au support central, pas
// aux référents SNU synchronisés (PM44).
router.use(requireRole("AGENT"));

router.post("/",
  validateBody(Joi.object({
    q: Joi.string().trim().max(128),
    beginningDate: Joi.date(),
    endingDate: Joi.date(),
    contactGroup: Joi.array().items(Joi.string().token().lowercase())
  })),
  async (req, res) => {
    let query = {};
    if (req.cleanBody.q) {
      // Motif échappé et ancré : la saisie brute alimentait un `$regex` (injection NoSQL / ReDoS, L51).
      query.search = { $regex: autocompleteRegex(req.cleanBody.q), $options: "i" };
    }
    if (req.cleanBody.contactGroup) {
      query.role = { $in: req.cleanBody.contactGroup };
    }
    if (req.cleanBody.beginningDate && req.cleanBody.endingDate) {
      query.createdAt = { $gte: req.cleanBody.beginningDate, $lte: req.cleanBody.endingDate };
    } else if (req.cleanBody.beginningDate) {
      query.createdAt = { $gte: req.cleanBody.beginningDate };
    } else if (req.cleanBody.endingDate) {
      query.createdAt = { $lte: req.cleanBody.endingDate };
    }
    // Journal des recherches, potentiellement volumineux : borné pour éviter de charger l'historique
    // entier en mémoire (PL19).
    const data = await KbSearchModel.find(query).sort({ createdAt: -1 }).limit(500);

    return res.status(200).send({ ok: true, data });
  }
);

module.exports = router;
