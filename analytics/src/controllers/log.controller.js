const express = require("express");
const router = express.Router();
const Joi = require("joi");

const { capture } = require("../sentry");
const LogYoungModel = require("../models/log-youngs.model");
const LogStructureModel = require("../models/log-structures.model");
const LogClasseModel = require("../models/log-classes.model");
const LogMissionModel = require("../models/log-missions.model");
const LogApplicationModel = require("../models/log-applications.model");
const LogMissionEquivalenceModel = require("../models/log-mission-equivalence.model");
const authMiddleware = require("../middlewares/auth.middleware");
const validationMiddleware = require("../middlewares/validation.middleware");

router.get("/", async (req, res) => {
  try {
    // const logs = await LogModel.findAll();
    // return res.status(200).send({ ok: false, data: logs });

    return res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
  }
});

router.post(
  "/young",
  authMiddleware,
  validationMiddleware({
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
    user_source: Joi.string().allow(null, ""),
    user_classe_id: Joi.string().allow(null, ""),
    user_etablissement_id: Joi.string().allow(null, ""),
    user_rural: Joi.string().valid("true", "false").allow(null),
    user_age: Joi.number(),
    date: Joi.string(),
    raw_data: Joi.object(),
    evenement_valeur_originelle: Joi.string().allow(null),
    modifier_user_id: Joi.string().allow(null),
    modifier_user_role: Joi.string().allow(null),
    modifier_user_first_name: Joi.string().allow(null),
  }),
  async ({ body }, res) => {
    try {
      body.date = new Date(body.date);
      const log = await LogYoungModel.create(body);

      return res.status(200).send({ ok: true, data: log });
    } catch (error) {
      capture(error);
    }
  },
);

router.post(
  "/structure",
  authMiddleware,
  validationMiddleware({
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
  }),
  async ({ body }, res) => {
    try {
      body.date = new Date(body.date);
      const log = await LogStructureModel.create(body);

      return res.status(200).send({ ok: true, data: log });
    } catch (error) {
      capture(error);
    }
  },
);

router.post(
  "/mission",
  authMiddleware,
  validationMiddleware({
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
  }),
  async ({ body }, res) => {
    try {
      body.date = new Date(body.date);
      const log = await LogMissionModel.create(body);

      return res.status(200).send({ ok: true, data: log });
    } catch (error) {
      capture(error);
    }
  },
);

router.post(
  "/application",
  authMiddleware,
  validationMiddleware({
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
  }),
  async ({ body }, res) => {
    try {
      body.date = new Date(body.date);
      const log = await LogApplicationModel.create(body);

      return res.status(200).send({ ok: true, data: log });
    } catch (error) {
      capture(error);
    }
  },
);

router.post(
  "/mission-equivalence",
  authMiddleware,
  validationMiddleware({
    evenement_nom: Joi.string().trim().required(),
    evenement_type: Joi.string().trim().required(),
    evenement_valeur: Joi.string().allow(null, ""),
    candidature_id: Joi.string().allow(null, ""),
    candidature_user_id: Joi.string().allow(null, ""),
    candidature_structure_name: Joi.string().allow(null, ""),
    candidature_structure_id: Joi.string().allow(null, ""),
    candidature_status: Joi.string().allow(null, ""),
    date: Joi.string(),
    raw_data: Joi.object(),
    type_engagement: Joi.string().allow(null, ""),
  }),
  async ({ body }, res) => {
    try {
      body.date = new Date(body.date);

      const log = await LogMissionEquivalenceModel.create(body);
      return res.status(200).send({ ok: true, data: log });
    } catch (error) {
      console.log("Error ", error);
      capture(error);
    }
  },
);

router.post(
  "/classe",
  authMiddleware,
  validationMiddleware({
    evenement_nom: Joi.string().trim().required(),
    evenement_valeur: Joi.string().allow(null, ""),
    evenement_type: Joi.string().trim().required(),
    classe_id: Joi.string().trim().required(),
    classe_etablissement_id: Joi.string().trim().required(),
    classe_name: Joi.string().allow(null, ""),
    classe_type: Joi.string().allow(null, ""),
    date: Joi.string(),
    raw_data: Joi.object(),
  }),
  async ({ body }, res) => {
    try {
      body.date = new Date(body.date);
      const log = await LogClasseModel.create(body);

      return res.status(200).send({ ok: true, data: log });
    } catch (error) {
      capture(error);
    }
  },
);

module.exports = router;
