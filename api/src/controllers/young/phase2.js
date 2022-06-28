const express = require("express");
const passport = require("passport");
const router = express.Router({ mergeParams: true });
const Joi = require("joi");

const { capture } = require("../../sentry");
const YoungModel = require("../../models/young");
const MissionEquivalenceModel = require("../../models/missionEquivalence");
const ApplicationModel = require("../../models/application");
const { ERRORS } = require("../../utils");
const { canApplyToPhase2 } = require("snu-lib");

router.post("/equivalence", passport.authenticate(["referent", "young"], { session: false, failWithError: true }), async (req, res) => {
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

    const isYoung = req.user.constructor.modelName === "young";

    if (isYoung && !canApplyToPhase2(young)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

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

router.put("/equivalence/:idEquivalence", passport.authenticate(["referent", "young"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      id: Joi.string().required(),
      idEquivalence: Joi.string().required(),
      status: Joi.string().valid("WAITING_VERIFICATION", "WAITING_CORRECTION", "VALIDATED", "REFUSED"),
      type: Joi.string().trim().valid("Service Civique", "BAFA", "Jeune Sapeur Pompier"),
      structureName: Joi.string().trim(),
      address: Joi.string().trim(),
      zip: Joi.string().trim(),
      city: Joi.string().trim(),
      startDate: Joi.string().trim(),
      endDate: Joi.string().trim(),
      frequency: Joi.object().keys({
        nombre: Joi.string().trim().required(),
        duree: Joi.string().trim().valid("Heure(s)", "Demi-journée(s)", "Jour(s)").required(),
        frequence: Joi.string().valid("Par semaine", "Par mois", "Par an").trim().required(),
      }),
      contactFullName: Joi.string().trim(),
      contactEmail: Joi.string().trim(),
      files: Joi.array().items(Joi.string().required()).min(1),
      message: Joi.string().trim(),
    }).validate({ ...req.params, ...req.body });

    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY, error });

    const young = await YoungModel.findById(value.id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.YOUNG_NOT_FOUND });

    if (!canApplyToPhase2(young)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const equivalence = await MissionEquivalenceModel.findById(value.idEquivalence);
    if (!equivalence) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (["WAITING_CORRECTION", "VALIDATED", "REFUSED"].includes(value.status) && req.user?.role) {
      if (young.statusPhase2 !== "VALIDATED" && value.status === "VALIDATED") {
        young.set({ statusPhase2: "VALIDATED" });
      }
      if (young.statusPhase2 === "VALIDATED" && ["WAITING_CORRECTION", "REFUSED"].includes(value.status)) {
        const applications = await ApplicationModel.find({ youngId: young._id });
        const activeApplications = applications.filter((application) => ["WAITING_VERIFICATION", "WAITING_VALIDATION", "IN_PROGRESS", "VALIDATED"].includes(application.status));

        //Le status phase deux est set a In_Progress si on a des candidateure active
        if (activeApplications.length) {
          young.set({ statusPhase2: "IN_PROGRESS" });
        } else {
          young.set({ statusPhase2: "WAITING_REALISATION" });
        }
      }
    }

    delete value.id;
    delete value.idEquivalence;
    equivalence.set(value);
    await equivalence.save({ fromUser: req.user });
    await young.save({ fromUser: req.user });

    res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/equivalences", passport.authenticate(["referent", "young"], { session: false, failWithError: true }), async (req, res) => {
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

router.put("/militaryPreparation/status", passport.authenticate(["young", "referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      id: Joi.string().required(),
      statusMilitaryPreparationFiles: Joi.string().required().valid("VALIDATED", "WAITING_VALIDATION", "WAITING_CORRECTION", "REFUSED", "WAITING_UPLOAD"),
    }).validate({
      ...req.params,
      ...req.body,
    });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY, error });

    const young = await YoungModel.findById(value.id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.YOUNG_NOT_FOUND });

    young.set({ statusMilitaryPreparationFiles: value.statusMilitaryPreparationFiles });
    await young.save({ fromUser: req.user });
    res.status(200).send({ ok: true, data: young });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
