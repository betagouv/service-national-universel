const express = require("express");
const router = express.Router();
const passport = require("passport");
const { capture } = require("../../sentry");
const { ERRORS } = require("../../utils");
const Joi = require("joi");
const { canSendPlanDeTransport, MIME_TYPES} = require("snu-lib");
const FileType = require("file-type");
const fs = require("fs");
const config = require("../../config");
const NodeClam = require("clamscan");
const XLSX = require("xlsx");

router.post("/:cohortName", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    // --- validate entries
    const { error, value } = Joi.object({
      cohortName: Joi.string().required(),
    }).validate(req.params, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
    const { cohortName } = value;

    const files = Object.values(req.files);
    if (files.length === 0) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }
    const file = files[0];

    // --- rights
    if (!canSendPlanDeTransport(req.user)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    // --- verify file
    const { name, tempFilePath, mimetype, size } = file;
    const filetype = await FileType.fromFile(tempFilePath);
    const mimeFromMagicNumbers = filetype ? filetype.mime : MIME_TYPES.EXCEL;
    const validTypes = [MIME_TYPES.EXCEL];
    if (!(validTypes.includes(mimetype) && validTypes.includes(mimeFromMagicNumbers))) {
      fs.unlinkSync(tempFilePath);
      return res.status(500).send({ ok: false, code: "UNSUPPORTED_TYPE" });
    }

    if (config.ENVIRONMENT === "staging" || config.ENVIRONMENT === "production") {
      try {
        const clamscan = await new NodeClam().init({
          removeInfected: true,
        });
        const { isInfected } = await clamscan.isInfected(tempFilePath);
        if (isInfected) {
          capture(`File ${name} of user(${req.user.id})is infected`);
          return res.status(403).send({ ok: false, code: ERRORS.FILE_INFECTED });
        }
      } catch {
        return res.status(500).send({ ok: false, code: ERRORS.FILE_SCAN_DOWN });
      }
    }

    // --- get data
    const workbook = XLSX.readFile(tempFilePath);
    const worksheet = Object.values(workbook.Sheets)[0];
    const lines = XLSX.utils.sheet_to_json(worksheet, { raw: false });
    console.log("lines...: ", lines);

    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
