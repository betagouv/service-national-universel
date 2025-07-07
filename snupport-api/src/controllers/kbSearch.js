const express = require("express");
const router = express.Router();
const Joi = require("joi");
const KbSearchModel = require("../models/kbSearch");
const { diacriticSensitiveRegex } = require("../utils");
const  { agentGuard } = require("../middlewares/authenticationGuards");
const { validateBody } = require("../middlewares/validation");

router.use(agentGuard);

router.post("/",
  validateBody(Joi.object({
    q: Joi.string().trim(),
    beginningDate: Joi.date(),
    endingDate: Joi.date(),
    contactGroup: Joi.array().items(Joi.string().token().lowercase())
  })),
  async (req, res) => {
    let query = {};
    if (req.cleanBody.q) {
      query.search = { $regex: diacriticSensitiveRegex(req.cleanBody.q), $options: "-i" };
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
    console.log(query)
    const data = await KbSearchModel.find(query).sort({ createdAt: -1 });

    return res.status(200).send({ ok: true, data });
  }
);

module.exports = router;
