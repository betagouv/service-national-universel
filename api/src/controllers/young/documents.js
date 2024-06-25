const express = require("express");
const passport = require("passport");
const Joi = require("joi");
const router = express.Router({ mergeParams: true });
const { capture } = require("../../sentry");
const YoungObject = require("../../models/young");
const CohortObject = require("../../models/cohort");
const ContractObject = require("../../models/contract");
const ApplicationObject = require("../../models/application");
const { ERRORS, isYoung, isReferent, getCcOfYoung, uploadFile, deleteFile, getFile } = require("../../utils");
const { sendTemplate } = require("../../sendinblue");
const { FILE_KEYS, MILITARY_FILE_KEYS, SENDINBLUE_TEMPLATES, COHORTS, canSendFileByMailToYoung, canDownloadYoungDocuments, canEditYoung } = require("snu-lib");
const fs = require("fs");
const fileUpload = require("express-fileupload");
const mongoose = require("mongoose");
const { decrypt, encrypt } = require("../../cryptoUtils");
const { serializeYoung } = require("../../utils/serializer");
const mime = require("mime-types");
const scanFile = require("../../utils/virusScanner");
const { generatePdfIntoStream, generatePdfIntoBuffer } = require("../../utils/pdf-renderer");
const { getMimeFromFile } = require("../../utils/file");

function getMailParams(type, template, young, contract) {
  if (type === "certificate" && template === "1")
    return {
      object: `Attestation de fin de phase 1 de ${young.firstName}`,
      message: `Vous trouverez en pièce-jointe de ce mail l'attestation de réalisation de phase 1 du SNU.`,
    };
  if (type === "certificate" && template === "2")
    return {
      object: `Attestation de fin de phase 2 de ${young.firstName}`,
      message: `Vous trouverez en pièce-jointe de ce mail l'attestation de réalisation de phase 2 du SNU.`,
    };
  if (type === "certificate" && template === "3")
    return {
      object: `Attestation de fin de phase 3 de ${young.firstName}`,
      message: `Vous trouverez en pièce-jointe de ce mail l'attestation de réalisation de phase 3 du SNU.`,
    };
  if (type === "certificate" && template === "snu")
    return {
      object: `Attestation de réalisation du SNU de ${young.firstName}`,
      message: `Vous trouverez en pièce-jointe de ce mail l'attestation de réalisation du SNU.`,
    };
  if (type === "contract" && template === "2" && contract)
    return {
      object: `Contrat de la mission ${contract.missionName}`,
      message: `Vous trouverez en pièce-jointe de ce mail le contract de la mission ${contract.missionName}.`,
    };
  if (type === "convocation" && template === "cohesion") {
    return {
      object: `Convocation au séjour de cohésion de ${young.firstName} ${young.lastName}`,
      message: "Vous trouverez en pièce-jointe de ce mail votre convocation au séjour de cohésion à présenter à votre arrivée au point de rassemblement.",
    };
  }
}

router.post("/:type/:template", async (req, res) => {
  try {
    const { error, value } = Joi.object({ id: Joi.string().required(), type: Joi.string().required(), template: Joi.string().required() })
      .unknown()
      .validate(req.params, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
    const { id, type, template } = value;

    const young = await YoungObject.findById(id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    // A young can only download their own documents.
    if (isYoung(req.user) && young._id.toString() !== req.user._id.toString()) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
    }

    const applications = await ApplicationObject.find({ youngId: young._id.toString(), structureId: req?.user?.structureId?.toString() });
    if (isReferent(req.user) && !canDownloadYoungDocuments(req.user, young, type, applications)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
    }

    await generatePdfIntoStream(res, { type, template, young });
  } catch (e) {
    capture(e);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

// todo: refacto
router.post("/:type/:template/send-email", passport.authenticate(["young", "referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      id: Joi.string().required(),
      type: Joi.string().required(),
      template: Joi.string().required(),
      contract_id: Joi.string(),
      switchToCle: Joi.boolean(),
    })
      .unknown()
      .validate({ ...req.params, ...req.body, ...req.query }, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
    const { id, type, template, fileName, contract_id, switchToCle } = value;

    const young = await YoungObject.findById(id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    // A young can only send to them their own documents.
    if (isYoung(req.user) && young._id.toString() !== req.user._id.toString()) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
    }
    if (isReferent(req.user) && !canSendFileByMailToYoung(req.user, young)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
    }

    let contract;
    if (type === "contract") {
      if (!contract_id) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

      contract = await ContractObject.findById(contract_id);
      if (!contract) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }

    const buffer = await generatePdfIntoBuffer({ type, template, young, contract });

    const content = buffer.toString("base64");

    const { object, message } = getMailParams(type, template, young, contract);
    let emailTemplate = SENDINBLUE_TEMPLATES.young.DOCUMENT;
    let params = { object, message };

    if (switchToCle) {
      emailTemplate = SENDINBLUE_TEMPLATES.young.PHASE_1_ATTESTATION_SWITCH_CLE;
    }

    const mail = await sendTemplate(emailTemplate, {
      emailTo: [{ name: `${young.firstName} ${young.lastName}`, email: young.email }],
      attachment: [{ content, name: fileName }],
      params,
      cc: getCcOfYoung({ template: emailTemplate, young }),
    });
    res.status(200).send({ ok: true, data: mail });
  } catch (e) {
    capture(e);
    res.status(500).send({ ok: false, e, code: ERRORS.SERVER_ERROR });
  }
});

// Upload one or more files
router.post(
  "/:key",
  passport.authenticate(["young", "referent"], { session: false, failWithError: true }),
  fileUpload({ limits: { fileSize: 10 * 1024 * 1024 }, useTempFiles: true, tempFileDir: "/tmp/" }),
  async (req, res) => {
    try {
      // Validate

      const { error, value } = Joi.object({
        id: Joi.string().alphanum().length(24).required(),
        key: Joi.string()
          .valid(...FILE_KEYS, ...MILITARY_FILE_KEYS)
          .required(),
      }).validate(req.params, { stripUnknown: true });
      if (error) {
        capture(error);
        return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
      }
      const { id, key } = value;

      const { error: filesError, value: files } = Joi.array()
        .items(
          Joi.alternatives().try(
            Joi.object({
              name: Joi.string().required(),
              data: Joi.binary().required(),
              tempFilePath: Joi.string().allow("").optional(),
            }).unknown(),
            Joi.array().items(
              Joi.object({
                name: Joi.string().required(),
                data: Joi.binary().required(),
                tempFilePath: Joi.string().allow("").optional(),
              }).unknown(),
            ),
          ),
        )
        .validate(
          Object.keys(req.files || {}).map((e) => req.files[e]),
          { stripUnknown: true },
        );
      if (filesError) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });

      const { error: bodyError, value: body } = Joi.object({
        category: Joi.string(),
        expirationDate: Joi.date(),
        side: Joi.string().valid("recto", "verso"),
      }).validate(JSON.parse(req.body.body), { stripUnknown: true });
      if (bodyError) {
        capture(bodyError);
        return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
      }

      // Check permissions

      const young = await YoungObject.findById(id);
      if (!young) return res.status(404).send({ ok: false, code: ERRORS.YOUNG_NOT_FOUND });

      if (isYoung(req.user) && req.user.id !== id) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
      if (isReferent(req.user) && !canEditYoung(req.user, young)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
      if (body.category === "cniFiles" && young.files.cniFiles.length >= 3) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });

      // Upload files

      for (let currentFile of files) {
        // If multiple file with same names are provided, currentFile is an array. We just take the latest.
        if (Array.isArray(currentFile)) {
          currentFile = currentFile[currentFile.length - 1];
        }
        const { name, tempFilePath, mimetype, size } = currentFile;
        const filetype = await getMimeFromFile(tempFilePath);
        const mimeFromContent = filetype || "application/pdf";
        const validTypes = ["image/jpeg", "image/png", "application/pdf"];
        if (!(validTypes.includes(mimetype) && validTypes.includes(mimeFromContent))) {
          capture(`File ${name} of user(${req.user.id})is not a valid type: ${mimetype} ${mimeFromContent}`);
          fs.unlinkSync(tempFilePath);
          return res.status(400).send({ ok: false, code: "UNSUPPORTED_TYPE" });
        }

        const scanResult = await scanFile(tempFilePath, name, req.user.id);
        if (scanResult.infected) {
          return res.status(403).send({ ok: false, code: ERRORS.FILE_INFECTED });
        }

        // align date
        const formatedDate = body.expirationDate;
        formatedDate?.setUTCHours(11, 0, 0, 0);
        body.expirationDate = formatedDate;

        // Create document
        const newFile = {
          _id: mongoose.Types.ObjectId(),
          name: decodeURIComponent(name),
          size,
          uploadedAt: Date.now(),
          mimetype,
          category: body.category,
          expirationDate: body.expirationDate,
          side: body.side,
        };

        // Upload file using ObjectId as file name

        const data = fs.readFileSync(tempFilePath);
        const encryptedBuffer = encrypt(data);
        const resultingFile = { mimetype: mimeFromContent, encoding: "7bit", data: encryptedBuffer };
        if (MILITARY_FILE_KEYS.includes(key)) {
          await uploadFile(`app/young/${id}/military-preparation/${key}/${newFile._id}`, resultingFile);
        } else {
          await uploadFile(`app/young/${id}/${key}/${newFile._id}`, resultingFile);
        }
        fs.unlinkSync(tempFilePath);

        // Add record to young
        if (!young.files?.[key]) {
          young.files[key] = [];
        }
        young.files[key].push(newFile);
        if (key === "cniFiles") {
          young.latestCNIFileExpirationDate = body.expirationDate;
          if (young.cohort !== COHORTS.AVENIR) {
            const cohort = await CohortObject.findOne({ name: young.cohort });
            young.CNIFileNotValidOnStart = young.latestCNIFileExpirationDate < new Date(cohort.dateStart);
          }
          young.latestCNIFileCategory = body.category;
        }
      }

      // Save young with new records

      await young.save({ fromUser: req.user });
      return res.status(200).send({ young: serializeYoung(young, req.user), data: young.files[key], ok: true });
    } catch (error) {
      capture(error);
      if (error === "FILE_CORRUPTED") return res.status(500).send({ ok: false, code: ERRORS.FILE_CORRUPTED });
      return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  },
);

// Delete one file
router.delete("/:key/:fileId", passport.authenticate(["young", "referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    // Validate

    const { error, value } = Joi.object({
      id: Joi.string().alphanum().length(24).required(),
      key: Joi.string()
        .valid(...FILE_KEYS, ...MILITARY_FILE_KEYS)
        .required(),
      fileId: Joi.string().alphanum().length(24).required(),
    })
      .unknown()
      .validate(req.params, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
    const { id, key, fileId } = value;

    // Check permissions

    const young = await YoungObject.findById(id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.YOUNG_NOT_FOUND });

    if (isYoung(req.user) && req.user.id !== id) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
    if (isReferent(req.user) && !canEditYoung(req.user, young)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });

    // Delete on s3

    if (key.includes("militaryPreparationFiles")) {
      await deleteFile(`app/young/${id}/military-preparation/${key}/${fileId}`);
    } else {
      await deleteFile(`app/young/${id}/${key}/${fileId}`);
    }

    // Delete record

    const recordToDelete = young.files[key].id(fileId);
    if (!recordToDelete) return res.status(404).send({ ok: false, code: ERRORS.FILE_NOT_FOUND });
    recordToDelete.remove();
    await young.save({ fromUser: req.user });

    return res.status(200).send({ data: young.files[key], ok: true });
  } catch (e) {
    capture(e);
  }
});

// Get the list of files for a given key
router.get("/:key", passport.authenticate(["young", "referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    // Validate

    const { error, value } = Joi.object({
      id: Joi.string().alphanum().length(24).required(),
      key: Joi.string()
        .valid(...FILE_KEYS, ...MILITARY_FILE_KEYS)
        .required(),
    })
      .unknown()
      .validate({ ...req.params }, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
    const { id, key } = value;

    // Check permissions

    const young = await YoungObject.findById(id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.YOUNG_NOT_FOUND });

    if (isYoung(req.user) && req.user.id !== id) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });

    const applications = await ApplicationObject.find({ youngId: young._id.toString(), structureId: req?.user?.structureId?.toString() });
    if (isReferent(req.user) && !canDownloadYoungDocuments(req.user, young, applications)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
    }
    // Send response

    return res.status(200).send({ data: young.files[key], ok: true });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

// Download one file
router.get("/:key/:fileId", passport.authenticate(["young", "referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    // Validate

    const { error, value } = Joi.object({
      id: Joi.string().alphanum().length(24).required(),
      key: Joi.string()
        .valid(...FILE_KEYS, ...MILITARY_FILE_KEYS)
        .required(),
      fileId: Joi.string().alphanum().length(24).required(),
    })
      .unknown()
      .validate({ ...req.params }, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
    const { id, key, fileId } = value;

    const young = await YoungObject.findById(id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.YOUNG_NOT_FOUND });

    if (isYoung(req.user) && req.user.id !== id) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });

    const applications = await ApplicationObject.find({ youngId: young._id.toString(), structureId: req?.user?.structureId?.toString() });
    if (isReferent(req.user) && !canDownloadYoungDocuments(req.user, young, applications)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
    }
    // Download from s3

    let downloaded = null;
    try {
      if (key.includes("militaryPreparationFiles")) {
        downloaded = await getFile(`app/young/${id}/military-preparation/${key}/${fileId}`);
      } else {
        downloaded = await getFile(`app/young/${id}/${key}/${fileId}`);
      }
    } catch (e) {
      if (!downloaded) {
        downloaded = await getFile(`app/young/${id}/${key}/${fileId}`);
      }
    }

    // * Recalculate mimetype for reupload
    const decryptedBuffer = decrypt(downloaded.Body);

    // Send to app
    return res.status(200).send({
      data: Buffer.from(decryptedBuffer, "base64"),
      mimeType: mime.lookup(young.files[key].id(fileId).name),
      fileName: young.files[key].id(fileId).name,
      ok: true,
    });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
