const express = require("express");
const passport = require("passport");
const router = express.Router({ mergeParams: true });
const Joi = require("joi");

const { capture } = require("../../sentry");
const YoungModel = require("../../models/young");
const MissionEquivalenceModel = require("../../models/missionEquivalence");
const { ERRORS } = require("../../utils");

router.post("/equivalence", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      id: Joi.string().required(),
      type: Joi.string().trim().valid("Service Civique", "BAFA", "Jeune Sapeur Pompier").required(),
      structureName: Joi.string().trim().required(),
      address: Joi.string().trim().required(),
      zip: Joi.string().trim().required(),
      city: Joi.string().trim().required(),
      startDate: Joi.string().trim().required(),
      endDate: Joi.string().trim().required(),
      frequency: Joi.object().keys({
        nombre: Joi.string().trim().required(),
        duree: Joi.string().trim().valid("Heure(s)", "Demi-journée(s)", "Jour(s)").required(),
        frequence: Joi.string().valid("Par semaine", "Par mois", "Par an").trim().required(),
      }),
      contactFullName: Joi.string().trim().required(),
      contactEmail: Joi.string().trim().required(),
      files: Joi.array().items(Joi.string().required()).required().min(1),
    }).validate({ ...req.params, ...req.body });

    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });

    const young = await YoungModel.findById(value.id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.YOUNG_NOT_FOUND });

    //Pas plus de 3 demandes d'équivalence + creation possible seulement si le statut des ancienne equiv est "REFUSED"
    const equivalences = await MissionEquivalenceModel.find({ youngId: value.id });
    if (equivalences.length >= 3) return res.status(400).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
    const filteredEquivalences = equivalences.filter((equivalence) => equivalence.status !== "REFUSED");
    if (filteredEquivalences.length > 0) return res.status(400).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });

    const youngId = value.id;
    delete value.id;
    await MissionEquivalenceModel.create({ ...value, youngId, status: "WAITING_VERIFICATION" });

    res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/equivalence/:idEquivalence", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      id: Joi.string().required(),
      idEquivalence: Joi.string().required(),
      status: Joi.string().valid("WAITING_VERIFICATION", "WAITING_CORRECTION").required(),
      type: Joi.string().trim().valid("Service Civique", "BAFA", "Jeune Sapeur Pompier").required(),
      structureName: Joi.string().trim().required(),
      address: Joi.string().trim().required(),
      zip: Joi.string().trim().required(),
      city: Joi.string().trim().required(),
      startDate: Joi.string().trim().required(),
      endDate: Joi.string().trim().required(),
      frequency: Joi.object().keys({
        nombre: Joi.string().trim().required(),
        duree: Joi.string().trim().valid("Heure(s)", "Demi-journée(s)", "Jour(s)").required(),
        frequence: Joi.string().valid("Par semaine", "Par mois", "Par an").trim().required(),
      }),
      contactFullName: Joi.string().trim().required(),
      contactEmail: Joi.string().trim().required(),
      files: Joi.array().items(Joi.string().required()).required().min(1),
    }).validate({ ...req.params, ...req.body });

    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY, error });

    const young = await YoungModel.findById(value.id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.YOUNG_NOT_FOUND });

    //Pas plus de 3 demandes d'équivalence + creation possible seulement si le statut des ancienne equiv est "REFUSED"
    const equivalence = await MissionEquivalenceModel.findById(value.idEquivalence);
    if (!equivalence) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    delete value.id;
    delete value.idEquivalence;
    equivalence.set(value);
    await equivalence.save({ fromUser: req.user });

    res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/equivalences", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({ id: Joi.string().required() }).validate({ ...req.params });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY, error });

    const young = await YoungModel.findById(value.id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.YOUNG_NOT_FOUND });

    const equivalences = await MissionEquivalenceModel.find({ youngId: value.id }).sort({ createdAt: -1 });
    res.status(200).send({ ok: true, data: equivalences });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/equivalence/:idEquivalence", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({ id: Joi.string().required(), idEquivalence: Joi.string().required() }).validate({ ...req.params });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY, error });

    const young = await YoungModel.findById(value.id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.YOUNG_NOT_FOUND });

    const equivalences = await MissionEquivalenceModel.findById(value.idEquivalence);
    res.status(200).send({ ok: true, data: equivalences });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
