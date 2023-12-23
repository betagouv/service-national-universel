const express = require("express");
const router = express.Router({ mergeParams: true });
const Joi = require("joi");
const passport = require("passport");
const CohortModel = require("../models/cohort");
const SessionPhase1Model = require("../models/sessionPhase1");

const { capture } = require("../sentry");
const { ERRORS, getFile, isReferent } = require("../utils");
const { decrypt } = require("../cryptoUtils");
const { ROLES, isSuperAdmin, COHORT_TYPE } = require("snu-lib");

const EXPORT_COHESION_CENTERS = "cohesionCenters";
const EXPORT_YOUNGS_BEFORE_SESSION = "youngsBeforeSession";
const EXPORT_YOUNGS_AFTER_SESSION = "youngsAfterSession";
const exportDateKeys = [EXPORT_COHESION_CENTERS, EXPORT_YOUNGS_BEFORE_SESSION, EXPORT_YOUNGS_AFTER_SESSION];

const xlsxMimetype = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

router.put("/:id/export/:exportDateKey", passport.authenticate(ROLES.ADMIN, { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error: exportDateKeyError, value: exportDateKey } = Joi.string()
      .valid(...exportDateKeys)
      .required()
      .validate(req.params.exportDateKey, { stripUnknown: true });

    const { error: idError, value: id } = Joi.string().required().validate(req.params.id, { stripUnknown: true });

    if (exportDateKeyError) {
      capture(exportDateKeyError);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    if (idError) {
      capture(idError);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const bodySchema = Joi.object().keys({
      date: Joi.date().allow(""),
    });

    const result = bodySchema.validate(req.body, { stripUnknown: true });
    const {
      error,
      value: { date },
    } = result;

    //ensure that date does not change base on time zone (works only for France)
    date.setHours(11);

    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    const today = new Date(new Date().setHours(0, 0, 0, 0));

    if (date <= today) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
    }

    let cohort = await CohortModel.findOne({ snuId: id });
    if (!cohort) {
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }

    if (!cohort.dsnjExportDates) {
      cohort.dsnjExportDates = {};
    }

    if (cohort.dsnjExportDates[exportDateKey] && cohort.dsnjExportDates[exportDateKey] <= today) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
    }

    cohort.dsnjExportDates[exportDateKey] = date;

    await cohort.save({ fromUser: req.user });

    return res.status(200).send({ ok: true, data: cohort });
  } catch (err) {
    capture(err);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/", passport.authenticate(["referent", "young"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      type: Joi.string(),
    })
      .unknown()
      .validate(req.query, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
    let query = {};
    if (value.type) query.type = value.type;
    // TODO: fix this
    // else query = { $or: [{ type: COHORT_TYPE.VOLONTAIRE }, { type: { $exists: false } }, { type: null }] };
    else if (isReferent(req.user)) query = { $or: [{ type: COHORT_TYPE.VOLONTAIRE }, { type: { $exists: false } }, { type: null }] };
    const cohorts = await CohortModel.find(query);
    return res.status(200).send({ ok: true, data: cohorts });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, data: [], code: ERRORS.SERVER_ERROR, error });
  }
});

router.get("/:cohort", passport.authenticate(["referent", "young"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      cohort: Joi.string().required(),
    })
      .unknown()
      .validate(req.params, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
    const cohort = await CohortModel.findOne({ name: value.cohort });
    return res.status(200).send({ ok: true, data: cohort });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.get("/bysession/:sessionId", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      sessionId: Joi.string().required(),
    })
      .unknown()
      .validate(req.params, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
    const session = await SessionPhase1Model.findById(value.sessionId);
    if (!session) {
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }
    const cohort = await CohortModel.findOne({ name: session.cohort });
    if (!cohort) {
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }

    return res.status(200).send({ ok: true, data: cohort });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.get("/:id/export/:exportKey", passport.authenticate([ROLES.ADMIN, ROLES.DSNJ], { session: false }), async (req, res) => {
  try {
    const { error: exportDateKeyError, value: exportKey } = Joi.string()
      .valid(...exportDateKeys)
      .required()
      .validate(req.params.exportKey, { stripUnknown: true });

    const { error: idError, value: id } = Joi.string().required().validate(req.params.id, { stripUnknown: true });

    if (exportDateKeyError) {
      capture(exportDateKeyError);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    if (idError) {
      capture(idError);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    let cohort = await CohortModel.findOne({ snuId: id });
    if (!cohort) {
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }

    const exportAvailableFrom = new Date(cohort.dsnjExportDates[exportKey].setHours(0, 0, 0, 0));
    const exportAvailableUntil = new Date(cohort.dateEnd);
    exportAvailableUntil.setMonth(exportAvailableUntil.getMonth() + 1);
    const now = new Date();

    if (!exportAvailableFrom || now < exportAvailableFrom || now > exportAvailableUntil) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
    }

    const formattedDate = exportAvailableFrom.toLocaleDateString("fr-FR");

    let file, fileName;
    if (exportKey === EXPORT_COHESION_CENTERS) {
      file = await getFile(`dsnj/${cohort.snuId}/${EXPORT_COHESION_CENTERS}.xlsx`);
      fileName = `DSNJ - Fichier des centres-${cohort.snuId}-${formattedDate}.xlsx`;
    }

    if (exportKey === EXPORT_YOUNGS_BEFORE_SESSION) {
      file = await getFile(`dsnj/${cohort.snuId}/${EXPORT_YOUNGS_BEFORE_SESSION}.xlsx`);
      fileName = `DSNJ - Fichier volontaire-${cohort.snuId}-${formattedDate}.xlsx`;
    }
    if (exportKey === EXPORT_YOUNGS_AFTER_SESSION) {
      file = await getFile(`dsnj/${cohort.snuId}/${EXPORT_YOUNGS_AFTER_SESSION}.xlsx`);
      fileName = `DSNJ - Fichier volontaire avec validation-${cohort.snuId}-${formattedDate}.xlsx`;
    }

    const decryptedBuffer = decrypt(file.Body);

    return res.status(200).send({
      data: Buffer.from(decryptedBuffer, "base64"),
      mimeType: xlsxMimetype,
      fileName,
      ok: true,
    });
  } catch (err) {
    capture(err);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/:cohort", passport.authenticate([ROLES.ADMIN], { session: false }), async (req, res) => {
  try {
    const { error: idError, value: cohortName } = Joi.string().required().validate(req.params.cohort, { stripUnknown: true });
    if (idError) {
      capture(idError);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
    const { error: bodyError, value: body } = Joi.object({
      dateStart: Joi.date().required(),
      dateEnd: Joi.date().required(),
      pdrChoiceLimitDate: Joi.date().required(),
      validationDate: Joi.date().allow(null, ""),
      validationDateForTerminaleGrade: Joi.date().allow(null, ""),
      manualAffectionOpenForAdmin: Joi.boolean().required(),
      manualAffectionOpenForReferentRegion: Joi.boolean().required(),
      manualAffectionOpenForReferentDepartment: Joi.boolean().required(),
      isAssignmentAnnouncementsOpenForYoung: Joi.boolean().required(),
      youngCheckinForAdmin: Joi.boolean().required(),
      youngCheckinForHeadOfCenter: Joi.boolean().required(),
      youngCheckinForRegionReferent: Joi.boolean().required(),
      youngCheckinForDepartmentReferent: Joi.boolean().required(),
      busListAvailability: Joi.boolean().required(),
      sessionEditionOpenForReferentRegion: Joi.boolean(),
      sessionEditionOpenForReferentDepartment: Joi.boolean(),
      sessionEditionOpenForTransporter: Joi.boolean(),
      pdrEditionOpenForReferentRegion: Joi.boolean(),
      pdrEditionOpenForReferentDepartment: Joi.boolean(),
      pdrEditionOpenForTransporter: Joi.boolean(),
      repartitionSchemaCreateAndEditGroupAvailability: Joi.boolean().required(),
      repartitionSchemaDownloadAvailability: Joi.boolean(),
      isTransportPlanCorrectionRequestOpen: Joi.boolean(),
      schemaAccessForReferentRegion: Joi.boolean(),
      schemaAccessForReferentDepartment: Joi.boolean(),
      busEditionOpenForTransporter: Joi.boolean(),
      uselessInformation: Joi.object().allow(null),
      daysToValidate: Joi.number().allow(null, ""),
      daysToValidateForTerminalGrade: Joi.number().allow(null, ""),
      inscriptionStartDate: Joi.date().required(),
      inscriptionEndDate: Joi.date().required(),
      instructionEndDate: Joi.date().required(),
      inscriptionModificationEndDate: Joi.date(),
    }).validate(req.body, { stripUnknown: true });
    if (bodyError) {
      capture(bodyError);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    if (!isSuperAdmin(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });

    const cohort = await CohortModel.findOne({ name: cohortName });

    if (!cohort) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    //set to 23h59 certains dates
    const valueToSet = ["pdrChoiceLimitDate", "validationDate", "validationDateForTerminaleGrade"];
    valueToSet.forEach((key) => {
      if (body[key]) {
        let date = new Date(body[key]);
        date.setHours(23, 59, 59, 999);
        body[key] = date;
      }
    });

    cohort.set({
      dateStart: formatDateTimeZone(body.dateStart),
      dateEnd: formatDateTimeZone(body.dateEnd),
      pdrChoiceLimitDate: formatDateTimeZone(body.pdrChoiceLimitDate),
      validationDate: formatDateTimeZone(body.validationDate),
      validationDateForTerminaleGrade: formatDateTimeZone(body.validationDateForTerminaleGrade),
      ...body,
    });

    await cohort.save({ fromUser: req.user });
    return res.status(200).send({ ok: true, data: cohort });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

const formatDateTimeZone = (date) => {
  //set timezone to UTC
  let d = new Date(date);
  d.toISOString();
  return d;
};

module.exports = router;
