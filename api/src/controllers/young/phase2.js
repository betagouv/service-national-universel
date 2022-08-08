const express = require("express");
const passport = require("passport");
const router = express.Router({ mergeParams: true });
const Joi = require("joi");
const config = require("../../config");
const { configureScope } = require("@sentry/node");

const { capture } = require("../../sentry");
const YoungModel = require("../../models/young");
const ReferentModel = require("../../models/referent");
const MissionEquivalenceModel = require("../../models/missionEquivalence");
const ApplicationModel = require("../../models/application");
const { ERRORS, getCcOfYoung } = require("../../utils");
const { canApplyToPhase2, SENDINBLUE_TEMPLATES, ROLES, SUB_ROLES } = require("snu-lib");
const { sendTemplate } = require("../../sendinblue");

// ! Do not work. Same name for all
configureScope((scope) => scope.setTransactionName(`/young/:id/phase2/`));

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
    await MissionEquivalenceModel.create({ ...value, youngId, status: isYoung ? "WAITING_VERIFICATION" : "VALIDATED" });
    if (isYoung) {
      young.set({ status_equivalence: "WAITING_VERIFICATION" });
    }
    if (!isYoung) {
      young.set({ status_equivalence: "VALIDATED", statusPhase2: "VALIDATED", statusPhase2ValidatedAt: Date.now() });
    }
    await young.save({ fromUser: req.user });

    let template = SENDINBLUE_TEMPLATES.young.EQUIVALENCE_WAITING_VERIFICATION;
    let cc = getCcOfYoung({ template, young });
    await sendTemplate(template, {
      emailTo: [{ name: `${young.firstName} ${young.lastName}`, email: young.email }],
      cc,
    });

    if (isYoung) {
      // get the manager_phase2
      let data = await ReferentModel.find({
        subRole: SUB_ROLES.manager_phase2,
        role: ROLES.REFERENT_DEPARTMENT,
        department: young.department,
      });

      // if not found, get the manager_department
      if (!data) {
        data = [];
        data.push(
          await ReferentModel.findOne({
            subRole: SUB_ROLES.manager_department,
            role: ROLES.REFERENT_DEPARTMENT,
            department: young.department,
          }),
        );
      }

      template = SENDINBLUE_TEMPLATES.referent.EQUIVALENCE_WAITING_VERIFICATION;
      await sendTemplate(template, {
        emailTo: data.map((referent) => ({
          name: `${referent.firstName} ${referent.lastName}`,
          email: referent.email,
        })),
        params: {
          cta: `${config.ADMIN_URL}/volontaire/${young._id}/phase2`,
          youngFirstName: young.firstName,
          youngLastName: young.lastName,
        },
      });
    }

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
      files: Joi.array().items(Joi.string()),
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
        young.set({ status_equivalence: "VALIDATED", statusPhase2: "VALIDATED", statusPhase2ValidatedAt: Date.now() });
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

    if (young.statusPhase2 !== "VALIDATED" && !["VALIDATED"].includes(value.status)) {
      young.set({ status_equivalence: value.status });
    }

    delete value.id;
    delete value.idEquivalence;
    equivalence.set(value);
    await equivalence.save({ fromUser: req.user });
    await young.save({ fromUser: req.user });

    let template = SENDINBLUE_TEMPLATES.young[`EQUIVALENCE_${value.status}`];
    let cc = getCcOfYoung({ template, young });
    await sendTemplate(template, {
      emailTo: [{ name: `${young.firstName} ${young.lastName}`, email: young.email }],
      params: { message: value?.message ? value.message : "" },
      cc,
    });

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
