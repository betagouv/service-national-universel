const express = require("express");
const router = express.Router({ mergeParams: true });
const Joi = require("joi");
const passport = require("passport");
const SessionModel = require("../models/session");

const { capture } = require("../sentry");
const { ERRORS, getFile } = require("../utils");
const { decrypt } = require("../cryptoUtils");
const { ROLES } = require("snu-lib");

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

    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    const today = new Date(new Date().setHours(0, 0, 0, 0));

    if (date <= today) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
    }

    let session = await SessionModel.findOne({ id });
    if (!session) {
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }

    if (!session.dsnjExportDates) {
      session.dsnjExportDates = {};
    }

    if (session.dsnjExportDates[exportDateKey] && session.dsnjExportDates[exportDateKey] <= today) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
    }

    session.dsnjExportDates[exportDateKey] = date;

    await session.save();

    return res.status(200).send({ ok: true, data: session });
  } catch (err) {
    capture(err);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/", passport.authenticate([ROLES.ADMIN, ROLES.DSNJ], { session: false }), async (_, res) => {
  try {
    const sessions = await SessionModel.find({});
    return res.status(200).send({ ok: true, data: sessions });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: SERVER_ERROR, error });
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

    let session = await SessionModel.findOne({ id });
    if (!session) {
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }

    const exportAvailableFrom = new Date(session.dsnjExportDates[exportKey]);
    const exportAvailableUntil = new Date(session.dateEnd);
    exportAvailableUntil.setMonth(exportAvailableUntil.getMonth() + 1);
    const now = new Date();

    if (!exportAvailableFrom || now < exportAvailableFrom || now > exportAvailableUntil) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
    }

    let file, fileName;
    if (exportKey === EXPORT_COHESION_CENTERS) {
      file = await getFile(`dsnj/${session.id}/${EXPORT_COHESION_CENTERS}.xlsx`);
      fileName = `DSNJ - Fichier des centres-${session.id}.xlsx`;
    }

    if (exportKey === EXPORT_YOUNGS_BEFORE_SESSION) {
      file = await getFile(`dsnj/${session.id}/${EXPORT_YOUNGS_BEFORE_SESSION}.xlsx`);
      fileName = `DSNJ - Fichier volontaire-${session.id}.xlsx`;
    }
    if (exportKey === EXPORT_YOUNGS_AFTER_SESSION) {
      file = await getFile(`dsnj/${session.id}/${EXPORT_YOUNGS_AFTER_SESSION}.xlsx`);
      fileName = `DSNJ - Fichier volontaire avec validation-${session.id}.xlsx`;
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

module.exports = router;
