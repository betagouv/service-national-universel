const express = require("express");
const router = express.Router();
const Joi = require("joi");

const LogModel = require("../models/log");

router.get("/", async (req, res) => {
  const logs = await LogModel.findAll();
  return res.status(200).send({ ok: false, data: logs });
});

//Rajouter authentification
router.post("/", async (req, res) => {
  console.log(req.body);
  const { error, value } = Joi.object({
    evenement_nom: Joi.string().trim().required(),
    evenement_type: Joi.string().trim().required(),
    user_id: Joi.string().trim().required(),
    user_genre: Joi.string(),
    user_date_de_naissance: Joi.string(),
    user_classe: Joi.string(),
    user_ecole_situation: Joi.string(),
    user_handicap_situation: Joi.string(),
    user_QPV: Joi.string(),
    user_departement: Joi.string(),
    user_region: Joi.string(),
    user_cohorte: Joi.string(),
    date: Joi.string(),
  }).validate(req.body);

  if (error) {
    console.log(error);
    return res.status(400).send({ ok: false, code: "INVALID_PARAMS" });
  }

  value.date = new Date(value.date);

  const logs = await LogModel.create(value);
  return res.status(200).send({ ok: false, data: logs });
});

module.exports = router;
