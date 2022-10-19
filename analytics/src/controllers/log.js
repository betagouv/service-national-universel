const express = require("express");
const router = express.Router();
const Joi = require("joi");

const LogYoungModel = require("../models/log_youngs");
const LogStructureModel = require("../models/log_structures");
const LogMissionModel = require("../models/log_missions");
const LogApplicationModel = require("../models/log_applications");
const auth = require("../auth");

router.get("/", async (req, res) => {
  const logs = await LogModel.findAll();
  return res.status(200).send({ ok: false, data: logs });
});

router.post("/young", auth, async (req, res) => {
  const { error, value } = Joi.object({
    evenement_nom: Joi.string().trim().required(),
    evenement_type: Joi.string().trim().required(),
    evenement_valeur: Joi.string().allow(null, ""),
    user_id: Joi.string().trim().required(),
    user_genre: Joi.string().allow(null, ""),
    user_date_de_naissance: Joi.string().allow(null, ""),
    user_classe: Joi.string().allow(null, ""),
    user_ecole_situation: Joi.string().allow(null, ""),
    user_handicap_situation: Joi.string().allow(null, ""),
    user_QPV: Joi.string().allow(null, ""),
    user_departement: Joi.string().allow(null, ""),
    user_region: Joi.string().allow(null, ""),
    user_cohorte: Joi.string().allow(null, ""),
    user_rural: Joi.string().valid("true", "false").allow(null),
    user_age: Joi.number(),
    date: Joi.string(),
    raw_data: Joi.object(),
  }).validate(req.body);

  if (error) {
    console.log(error);
    return res.status(400).send({ ok: false, code: "INVALID_PARAMS" });
  }

  value.date = new Date(value.date);
  const log = await LogYoungModel.create(value);
  console.log(log.id);
  return res.status(200).send({ ok: true, data: log });
});

router.post("/structure", auth, async (req, res) => {
  const { error, value } = Joi.object({
    evenement_nom: Joi.string().trim().required(),
    evenement_type: Joi.string().trim().required(),
    evenement_valeur: Joi.string().allow(null, ""),
    structure_id: Joi.string().trim().required(),
    structure_statut: Joi.string().allow(null, ""),
    stucture_statusLegal: Joi.string().allow(null, ""),
    structure_type: Joi.array(),
    structure_sousType: Joi.string().allow(null, ""),
    structure_nom: Joi.string().allow(null, ""),
    structure_departement: Joi.string().allow(null, ""),
    structure_region: Joi.string().allow(null, ""),
    structure_preparationMilitaire: Joi.string().allow(null, ""),
    structure_reseau: Joi.string().allow(null, ""),
    date: Joi.string(),
    raw_data: Joi.object(),
  }).validate(req.body);

  if (error) {
    console.log(error);
    return res.status(400).send({ ok: false, code: "INVALID_PARAMS" });
  }

  value.date = new Date(value.date);

  const log = await LogStructureModel.create(value);
  console.log(log.id);
  return res.status(200).send({ ok: true, data: log });
});

router.post("/mission", auth, async (req, res) => {
  const { error, value } = Joi.object({
    evenement_nom: Joi.string().trim().required(),
    evenement_type: Joi.string().trim().required(),
    evenement_valeur: Joi.string().allow(null, ""),
    mission_id: Joi.string().allow(null, ""),
    mission_structureId: Joi.string().allow(null, ""),
    mission_status: Joi.string().allow(null, ""),
    mission_nom: Joi.string().allow(null, ""),
    mission_departement: Joi.string().allow(null, ""),
    mission_region: Joi.string().allow(null, ""),
    mission_domaine: Joi.string().allow(null, ""),
    mission_duree: Joi.string().allow(null, ""),
    mission_placesTotal: Joi.number().allow(null, ""),
    mission_placesRestantes: Joi.number().allow(null, ""),
    mission_preparationMilitaire: Joi.string().allow(null, ""),
    mission_JVA: Joi.string().allow(null, ""),
    date: Joi.string(),
    raw_data: Joi.object(),
  }).validate(req.body);

  if (error) {
    console.log(error);
    return res.status(400).send({ ok: false, code: "INVALID_PARAMS" });
  }

  value.date = new Date(value.date);

  const log = await LogMissionModel.create(value);
  console.log(log.id);
  return res.status(200).send({ ok: true, data: log });
});

router.post("/application", auth, async (req, res) => {
  const { error, value } = Joi.object({
    evenement_nom: Joi.string().trim().required(),
    evenement_type: Joi.string().trim().required(),
    evenement_valeur: Joi.string().allow(null, ""),
    candidature_id: Joi.string().allow(null, ""),
    candidature_user_id: Joi.string().allow(null, ""),
    candidature_mission_id: Joi.string().allow(null, ""),
    candidature_structure_id: Joi.string().allow(null, ""),
    candidature_status: Joi.string().allow(null, ""),
    date: Joi.string(),
    raw_data: Joi.object(),
  }).validate(req.body);

  if (error) {
    console.log(error);
    return res.status(400).send({ ok: false, code: "INVALID_PARAMS" });
  }

  value.date = new Date(value.date);

  const log = await LogApplicationModel.create(value);
  console.log(log.id);
  return res.status(200).send({ ok: true, data: log });
});

module.exports = router;
