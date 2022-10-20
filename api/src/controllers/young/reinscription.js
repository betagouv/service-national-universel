const express = require("express");
const passport = require("passport");
const router = express.Router({ mergeParams: true });
const Joi = require("joi");

const YoungObject = require("../../models/young");
const { capture } = require("../../sentry");
const { serializeYoung } = require("../../utils/serializer");
const { ERRORS, STEPS2023REINSCRIPTION } = require("../../utils");
const { canUpdateYoungStatus, YOUNG_STATUS } = require("snu-lib");

router.put("/goToReinscription", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  try {
    const young = await YoungObject.findById(req.user._id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    young.set({ reinscriptionStep2023: STEPS2023REINSCRIPTION.ELIGIBILITE });
    await young.save({ fromUser: req.user });

    return res.status(200).send({ ok: true, data: serializeYoung(young) });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/eligibilite", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  try {
    const young = await YoungObject.findById(req.user._id);

    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const { error, value } = Joi.object({
      schooled: Joi.string().trim().required(),
      grade: Joi.string().trim().valid("4eme", "3eme", "2ndePro", "2ndeGT", "1erePro", "1ereGT", "TermPro", "TermGT", "CAP", "Autre", "NOT_SCOLARISE"),
      schoolName: Joi.string().trim(),
      schoolType: Joi.string().trim(),
      schoolAddress: Joi.string().trim(),
      schoolZip: Joi.string().trim(),
      schoolCity: Joi.string().trim(),
      schoolDepartment: Joi.string().trim(),
      schoolRegion: Joi.string().trim(),
      schoolCountry: Joi.string().trim(),
      schoolId: Joi.string().trim(),
      zip: Joi.string().trim(),
    }).validate({ ...req.body }, { stripUnknown: true });

    if (error) {
      console.log("🚀 ~ file: reinscription.js ~ line 49 ~ router.put ~ error", error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    if (!canUpdateYoungStatus({ body: value, current: young })) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    young.set({
      ...value,
      ...(value.livesInFrance === "true"
        ? {
            foreignCountry: "",
            foreignAddress: "",
            foreignCity: "",
            foreignZip: "",
            hostFirstName: "",
            hostLastName: "",
            hostRelationship: "",
          }
        : {}),
      reinscriptionStep2023: STEPS2023REINSCRIPTION.SEJOUR,
    });

    await young.save({ fromUser: req.user });
    return res.status(200).send({ ok: true, data: serializeYoung(young) });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/noneligible", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  try {
    const young = await YoungObject.findById(req.user._id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    young.reinscriptionStep2023 = STEPS2023REINSCRIPTION.NONELIGIBLE;
    young.status = YOUNG_STATUS.NOT_ELIGIBLE;

    await young.save({ fromUser: req.user });
    return res.status(200).send({ ok: true, data: serializeYoung(young) });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/changeCohort", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      originalCohort: Joi.string()
        .trim()
        .valid(
          "Février 2023 - C",
          "Avril 2023 - B",
          "Avril 2023 - A",
          "Juin 2023",
          "Juillet 2023",
          "Juillet 2022",
          "Juin 2022",
          "Février 2022",
          "2022",
          "2021",
          "2020",
          "2019",
          "à venir",
        )
        .required(),
      cohort: Joi.string().trim().valid("Février 2023 - C", "Avril 2023 - B", "Avril 2023 - A", "Juin 2023", "Juillet 2023").required(),
      cohortChangeReason: Joi.string().trim().required(),
    }).validate(req.body, { stripUnknown: true });

    if (error) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const young = await YoungObject.findById(req.user._id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (!canUpdateYoungStatus({ body: value, current: young })) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    value.reinscriptionStep2023 = STEPS2023REINSCRIPTION.DOCUMENTS;

    young.set(value);
    await young.save({ fromUser: req.user });
    return res.status(200).send({ ok: true, data: serializeYoung(young) });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/documents", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  try {
    const young = await YoungObject.findById(req.user._id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    young.set("reinscriptionStep2023", STEPS2023REINSCRIPTION.DONE);
    young.set("status", YOUNG_STATUS.VALIDATED);
    await young.save({ fromUser: req.user });
    return res.status(200).send({ ok: true, data: serializeYoung(young) });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
