const express = require("express");
const passport = require("passport");
const router = express.Router({ mergeParams: true });
const Joi = require("joi");
const config = require("config");

const { capture } = require("../../sentry");
const { YoungModel, CohortModel, ReferentModel, MissionEquivalenceModel, ApplicationModel } = require("../../models");
const { ERRORS, getCcOfYoung, cancelPendingApplications, updateYoungPhase2Hours, updateStatusPhase2, getFile } = require("../../utils");
const { canApplyToPhase2, SENDINBLUE_TEMPLATES, ROLES, SUB_ROLES, canEditYoung, UNSS_TYPE, APPLICATION_STATUS, ENGAGEMENT_TYPES, ENGAGEMENT_LYCEEN_TYPES } = require("snu-lib");
const { sendTemplate } = require("../../brevo");
const { validateId, validatePhase2Preference } = require("../../utils/validator");
const { decrypt } = require("../../cryptoUtils");
const { getMimeFromBuffer } = require("../../utils/file");
const mime = require("mime-types");

router.post("/equivalence", passport.authenticate(["referent", "young"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      id: Joi.string().required(),
      type: Joi.string()
        .trim()
        .valid(...ENGAGEMENT_TYPES)
        .required(),
      sousType: Joi.string()
        .trim()
        .valid(...UNSS_TYPE, ...ENGAGEMENT_LYCEEN_TYPES),
      desc: Joi.string().trim().when("type", { is: "Autre", then: Joi.required() }),
      structureName: Joi.string().trim().required(),
      address: Joi.string().trim().required(),
      zip: Joi.string().trim().required(),
      city: Joi.string().trim().required(),
      startDate: Joi.string().trim().required(),
      endDate: Joi.string().trim().required(),
      missionDuration: Joi.number().required(),
      contactFullName: Joi.string().trim().required(),
      contactEmail: Joi.string().trim().required(),
      files: Joi.array().items(Joi.string().required()).required().min(1),
    }).validate({ ...req.params, ...req.body }, { stripUnknown: true });

    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    const young = await YoungModel.findById(value.id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.YOUNG_NOT_FOUND });

    const isYoung = req.user.constructor.modelName === "young";
    const cohort = await CohortModel.findById(young.cohortId);

    if (isYoung && !canApplyToPhase2(young, cohort)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const youngId = value.id;
    delete value.id;
    const data = await MissionEquivalenceModel.create({ ...value, youngId, status: isYoung ? "WAITING_VERIFICATION" : "VALIDATED" });
    if (isYoung) {
      young.set({ status_equivalence: "WAITING_VERIFICATION" });
    }
    if (!isYoung) {
      young.set({ status_equivalence: "VALIDATED", statusPhase2: "VALIDATED", statusPhase2ValidatedAt: Date.now() });
      const applications = await ApplicationModel.find({ youngId: young._id });
      const pendingApplication = applications.filter((a) => a.status === APPLICATION_STATUS.WAITING_VALIDATION || a.status === APPLICATION_STATUS.WAITING_VERIFICATION);
      await cancelPendingApplications(pendingApplication, req.user);
      const applications_v2 = await ApplicationModel.find({ youngId: young._id });
      young.set({ phase2ApplicationStatus: applications_v2.map((e) => e.status) });
    }
    await young.save({ fromUser: req.user });

    await updateYoungPhase2Hours(young, req.user);

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

    res.status(200).send({ ok: true, data });
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
      type: Joi.string()
        .trim()
        .valid(...ENGAGEMENT_TYPES),
      sousType: Joi.string()
        .trim()
        .valid(...UNSS_TYPE, ...ENGAGEMENT_LYCEEN_TYPES),
      desc: Joi.string().trim(),
      structureName: Joi.string().trim(),
      address: Joi.string().trim(),
      zip: Joi.string().trim(),
      city: Joi.string().trim(),
      startDate: Joi.string().trim(),
      endDate: Joi.string().trim(),
      contactFullName: Joi.string().trim(),
      missionDuration: Joi.number(),
      contactEmail: Joi.string().trim(),
      files: Joi.array().items(Joi.string()),
      message: Joi.string().trim(),
    }).validate({ ...req.params, ...req.body }, { stripUnknown: true });
    if (!["Certification Union Nationale du Sport scolaire (UNSS)", "Engagements lycéens"].includes(value.type)) {
      value.sousType = undefined;
    }

    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY, error });
    }

    const young = await YoungModel.findById(value.id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.YOUNG_NOT_FOUND });

    const cohort = await CohortModel.findById(young.cohortId);

    if (!canApplyToPhase2(young, cohort)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const equivalence = await MissionEquivalenceModel.findById(value.idEquivalence);
    if (!equivalence) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    delete value.id;
    delete value.idEquivalence;
    equivalence.set(value);
    const data = await equivalence.save({ fromUser: req.user });

    if (["WAITING_CORRECTION", "VALIDATED", "REFUSED"].includes(value.status) && req.user?.role) {
      await updateYoungPhase2Hours(young, req.user);
      await updateStatusPhase2(young, req.user);
    }

    young.set({ status_equivalence: value.status });

    await young.save({ fromUser: req.user });

    if (SENDINBLUE_TEMPLATES.young[`EQUIVALENCE_${value.status}`]) {
      let template = SENDINBLUE_TEMPLATES.young[`EQUIVALENCE_${value.status}`];
      if (!template) {
        capture(`Template not found for EQUIVALENCE_${value.status}`);
        return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
      }
      let cc = getCcOfYoung({ template, young });
      await sendTemplate(template, {
        emailTo: [{ name: `${young.firstName} ${young.lastName}`, email: young.email }],
        params: { message: value?.message ? value.message : "" },
        cc,
      });
    }

    res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/equivalences", passport.authenticate(["referent", "young"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({ id: Joi.string().required() }).validate({ ...req.params }, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY, error });
    }

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
    const { error, value } = Joi.object({ id: Joi.string().required(), idEquivalence: Joi.string().required() }).validate({ ...req.params }, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY, error });
    }

    const young = await YoungModel.findById(value.id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.YOUNG_NOT_FOUND });

    const equivalence = await MissionEquivalenceModel.findById(value.idEquivalence);
    res.status(200).send({ ok: true, data: equivalence });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/militaryPreparation/status", passport.authenticate(["young", "referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      id: Joi.string().required(),
      statusMilitaryPreparationFiles: Joi.string().required().valid("VALIDATED", "WAITING_VERIFICATION", "WAITING_CORRECTION", "REFUSED"),
    }).validate(
      {
        ...req.params,
        ...req.body,
      },
      { stripUnknown: true },
    );
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY, error });
    }

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

router.put("/preference", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error: errorId, value: checkedId } = validateId(req.params.id);
    const { error: errorBody, value: checkedBody } = validatePhase2Preference(req.body);
    if (errorId || errorBody) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const young = await YoungModel.findById(checkedId);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (!canEditYoung(req.user, young)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }
    young.set(checkedBody);
    await young.save({ fromUser: req.user });

    return res.status(200).send({ ok: true, data: young });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/equivalence-file/:name", passport.authenticate(["referent", "young"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({ name: Joi.string().required() })
      .unknown()
      .validate({ ...req.params }, { stripUnknown: true });

    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const { name } = value;

    const downloaded = await getFile(`app/young/${req.user._id.toString()}/equivalenceFiles/${name}`);
    const decryptedBuffer = decrypt(downloaded.Body);

    const mimeFromFile = await getMimeFromBuffer(decryptedBuffer);

    return res.status(200).send({
      data: Buffer.from(decryptedBuffer, "base64"),
      mimeType: mimeFromFile ? mimeFromFile : mime.lookup(name),
      fileName: name,
      ok: true,
    });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
