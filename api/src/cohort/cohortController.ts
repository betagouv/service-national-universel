import express, { Response } from "express";
import Joi from "joi";
import passport from "passport";

import { ROLES, isSuperAdmin, COHORT_TYPE, formatDateTimeZone, COHORT_STATUS } from "snu-lib";

import { CohortModel, ClasseModel, YoungModel, SessionPhase1Model } from "../models";
import ClasseStateManager from "../cle/classe/stateManager";
import { capture } from "../sentry";
import { ERRORS, getFile, deleteFile } from "../utils";
import { decrypt } from "../cryptoUtils";
import { validateCohortDto } from "./cohortValidator";
import { UserRequest } from "../controllers/request";
import { validateId } from "../utils/validator";

const router = express.Router({ mergeParams: true });

const EXPORT_COHESION_CENTERS = "cohesionCenters";
const EXPORT_YOUNGS_BEFORE_SESSION = "youngsBeforeSession";
const EXPORT_YOUNGS_AFTER_SESSION = "youngsAfterSession";
const exportDateKeys = [EXPORT_COHESION_CENTERS, EXPORT_YOUNGS_BEFORE_SESSION, EXPORT_YOUNGS_AFTER_SESSION];

const xlsxMimetype = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

router.put("/:id/export-dsnj/:exportDateKey", passport.authenticate(ROLES.ADMIN, { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
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

    let cohort = await CohortModel.findById(id);
    if (!cohort) {
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }

    const threeMonthsAfterCohortDateEnd = new Date(cohort.dateEnd);
    threeMonthsAfterCohortDateEnd.setMonth(threeMonthsAfterCohortDateEnd.getMonth() + 3);

    if (date > threeMonthsAfterCohortDateEnd) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
    }

    if (!cohort.dsnjExportDates) {
      cohort.dsnjExportDates = {};
    }

    if (cohort.dsnjExportDates[exportDateKey]) {
      await deleteFile(`dsnj/${cohort.snuId}/${exportDateKey}.xlsx`);
    }

    cohort.dsnjExportDates[exportDateKey] = date;

    await cohort.save({ fromUser: req.user });

    return res.status(200).send({ ok: true, data: cohort });
  } catch (err) {
    capture(err);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/:id/export-injep/:exportDateKey", passport.authenticate(ROLES.ADMIN, { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
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

    let cohort = await CohortModel.findById(id);
    if (!cohort) {
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }

    const threeMonthsAfterCohortDateEnd = new Date(cohort.dateEnd);
    threeMonthsAfterCohortDateEnd.setMonth(threeMonthsAfterCohortDateEnd.getMonth() + 3);

    if (date > threeMonthsAfterCohortDateEnd) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
    }

    if (!cohort.injepExportDates) {
      cohort.injepExportDates = {};
    }

    if (cohort.injepExportDates[exportDateKey]) {
      await deleteFile(`injep/${cohort.snuId}/${exportDateKey}.xlsx`);
    }

    cohort.injepExportDates[exportDateKey] = date;

    await cohort.save({ fromUser: req.user });

    return res.status(200).send({ ok: true, data: cohort });
  } catch (err) {
    capture(err);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/", passport.authenticate(["referent", "young"], { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
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
    let query: any = {};
    if (value.type) query.type = value.type;
    const cohorts = await CohortModel.find(query);
    return res.status(200).send({ ok: true, data: cohorts });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, data: [], code: ERRORS.SERVER_ERROR, error });
  }
});

router.get("/public", async (_req: UserRequest, res: Response) => {
  try {
    let cohorts = await CohortModel.find({}, { name: 1, type: 1, status: 1, dateStart: 1, dateEnd: 1 }).lean();
    for (let cohort of cohorts) delete cohort._id;
    return res.status(200).send({ ok: true, data: cohorts });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.get("/:cohort", passport.authenticate(["referent", "young"], { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
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

router.get("/:cohortId/public", async (req: UserRequest, res: Response) => {
  try {
    const { error, value } = Joi.object({
      cohortId: Joi.string().required(),
    })
      .unknown()
      .validate(req.params, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
    const cohort = await CohortModel.findById(value.cohortId);

    if (!cohort) {
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }

    const data = {
      _id: cohort._id,
      name: cohort.name,
      type: cohort.type,
      dateStart: cohort.dateStart,
      dateEnd: cohort.dateEnd,
      isAssignmentAnnouncementsOpenForYoung: cohort.isAssignmentAnnouncementsOpenForYoung,
      inscriptionStartDate: cohort.inscriptionStartDate,
      inscriptionEndDate: cohort.inscriptionEndDate,
      instructionEndDate: cohort.instructionEndDate,
      inscriptionModificationEndDate: cohort.inscriptionModificationEndDate,
      reInscriptionStartDate: cohort.reInscriptionStartDate,
      reInscriptionEndDate: cohort.reInscriptionEndDate,
      pdrChoiceLimitDate: cohort.pdrChoiceLimitDate,
    };

    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.get("/bysession/:sessionId", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
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
    const cohort = await CohortModel.findById(session.cohortId);
    if (!cohort) {
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }

    return res.status(200).send({ ok: true, data: cohort });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.get("/:id/export-dsnj/:exportKey", passport.authenticate([ROLES.ADMIN, ROLES.DSNJ], { session: false }), async (req: UserRequest, res: Response) => {
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

    let cohort = await CohortModel.findById(id);
    if (!cohort) {
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }

    const exportAvailableFrom = new Date(cohort.dsnjExportDates![exportKey].setHours(0, 0, 0, 0));
    const exportAvailableUntil = new Date(cohort.dsnjExportDates![exportKey]);
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

    const decryptedBuffer = decrypt(file.Body) as any;

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

router.get("/:id/export-injep/:exportKey", passport.authenticate([ROLES.ADMIN, ROLES.INJEP], { session: false }), async (req: UserRequest, res: Response) => {
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

    let cohort = await CohortModel.findById(id);
    if (!cohort) {
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }

    const exportAvailableFrom = new Date(cohort.injepExportDates![exportKey].setHours(0, 0, 0, 0));
    const exportAvailableUntil = new Date(cohort.injepExportDates![exportKey]);
    exportAvailableUntil.setMonth(exportAvailableUntil.getMonth() + 1);
    const now = new Date();

    if (!exportAvailableFrom || now < exportAvailableFrom || now > exportAvailableUntil) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
    }

    const formattedDate = exportAvailableFrom.toLocaleDateString("fr-FR");

    let file, fileName;

    if (exportKey === EXPORT_YOUNGS_BEFORE_SESSION) {
      file = await getFile(`injep/${cohort.snuId}/${EXPORT_YOUNGS_BEFORE_SESSION}.xlsx`);
      fileName = `${formattedDate}-INJEP-${cohort.snuId}-avant-sejour.xlsx`;
    }
    if (exportKey === EXPORT_YOUNGS_AFTER_SESSION) {
      file = await getFile(`injep/${cohort.snuId}/${EXPORT_YOUNGS_AFTER_SESSION}.xlsx`);
      fileName = `${formattedDate}-INJEP-${cohort.snuId}-apres-sejour.xlsx`;
    }

    const decryptedBuffer = decrypt(file.Body) as any;

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

router.put("/:cohort", passport.authenticate([ROLES.ADMIN], { session: false }), async (req: UserRequest, res: Response) => {
  try {
    const { error: idError, value: cohortName } = Joi.string().required().validate(req.params.cohort, { stripUnknown: true });
    if (idError) {
      capture(idError);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
    const { error: bodyError, value: body } = validateCohortDto(req.body);
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
    const oldCohort = {
      inscriptionStartDate: cohort.inscriptionStartDate,
      inscriptionEndDate: cohort.inscriptionEndDate,
    };

    cohort.set({
      ...body,
      dateStart: formatDateTimeZone(body.dateStart),
      dateEnd: formatDateTimeZone(body.dateEnd),
    });

    if (body.pdrChoiceLimitDate) cohort.pdrChoiceLimitDate = formatDateTimeZone(body.pdrChoiceLimitDate);
    if (body.validationDate) cohort.validationDate = formatDateTimeZone(body.validationDate);
    if (body.validationDateForTerminaleGrade) cohort.validationDateForTerminaleGrade = formatDateTimeZone(body.validationDateForTerminaleGrade);

    await cohort.save({ fromUser: req.user });

    if (cohort.type === COHORT_TYPE.CLE && (oldCohort.inscriptionStartDate !== cohort.inscriptionStartDate || oldCohort.inscriptionEndDate !== cohort.inscriptionEndDate)) {
      const classes = await ClasseModel.find({ cohortId: cohort._id });
      for (const c of classes) {
        await ClasseStateManager.compute(c._id, req.user, { YoungModel });
      }
    }
    return res.status(200).send({ ok: true, data: cohort });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/:id/eligibility", passport.authenticate([ROLES.ADMIN], { session: false }), async (req: UserRequest, res: Response) => {
  try {
    const { error: idError, value: cohortId } = validateId(req.params.id);
    if (idError) {
      capture(idError);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const { error: bodyError, value: body } = Joi.object({
      zones: Joi.array().items(Joi.string()).required(),
      schoolLevels: Joi.array().items(Joi.string()).required(),
      bornAfter: Joi.date().required(),
      bornBefore: Joi.date().required(),
    }).validate(req.body, { stripUnknown: true });

    if (bodyError) {
      capture(bodyError);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    if (!isSuperAdmin(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });

    const cohort = await CohortModel.findOne({ _id: cohortId });

    if (!cohort) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    cohort.set({
      eligibility: {
        zones: body.zones,
        schoolLevels: body.schoolLevels,
        bornAfter: body.bornAfter,
        bornBefore: body.bornBefore,
      },
    });

    await cohort.save({ fromUser: req.user });

    return res.status(200).send({ ok: true, data: cohort });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
