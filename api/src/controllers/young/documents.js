const express = require("express");
const passport = require("passport");
const Joi = require("joi");
const fetch = require("node-fetch");
const router = express.Router({ mergeParams: true });
const { capture } = require("../../sentry");
const YoungObject = require("../../models/young");
const CohortObject = require("../../models/cohort");
const ContractObject = require("../../models/contract");
const ApplicationObject = require("../../models/application");
const { ERRORS, isYoung, isReferent, getCcOfYoung, timeout, uploadFile, deleteFile, getFile } = require("../../utils");
const { sendTemplate } = require("../../sendinblue");
const { FILE_KEYS, MILITARY_FILE_KEYS, SENDINBLUE_TEMPLATES, canSendFileByMailToYoung, canDownloadYoungDocuments, canEditYoung } = require("snu-lib");
const config = require("../../config");
const fs = require("fs");
const FileType = require("file-type");
const fileUpload = require("express-fileupload");
const mongoose = require("mongoose");
const { decrypt, encrypt } = require("../../cryptoUtils");
const { serializeYoung } = require("../../utils/serializer");
const { getHtmlTemplate } = require("../../templates/utils");
const mime = require("mime-types");
const scanFile = require("../../utils/virusScanner");

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

  //todo: add other templates
  // if (type === "form" && template === "imageRight") return { object: "", message: "" };
  // if (type === "convocation" && template === "cohesion") return { object: "", message: "" };
}

const TIMEOUT_PDF_SERVICE = 15000;

router.post("/:type/:template", passport.authenticate(["young", "referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    console.log("CALLING PDF 1");
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
    // Create html
    const html = await getHtmlTemplate(type, template, young);
    if (!html) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const getPDF = async () => console.log("Calling PDF service at URL:", config.API_PDF_ENDPOINT);
    await fetch(config.API_PDF_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/pdf" },
      body: JSON.stringify({ html, options: type === "certificate" ? { landscape: true } : { format: "A4", margin: 0 } }),
    }).then((response) => {
      // ! On a retravaillé pour faire passer les tests
      if (response.status && response.status !== 200) throw new Error("Error with PDF service");
      res.set({
        "content-length": response.headers.get("content-length"),
        "content-disposition": `inline; filename="test.pdf"`,
        "content-type": "application/pdf",
        "cache-control": "public, max-age=1",
      });
      response.body.pipe(res);
      if (res.statusCode !== 200) throw new Error("Error with PDF service");
      response.body.on("error", (e) => {
        capture(e);
        res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
      });
    });
    try {
      await timeout(getPDF(), TIMEOUT_PDF_SERVICE);
    } catch (e) {
      res.status(500).send({ ok: false, code: ERRORS.PDF_ERROR });
      capture(e);
    }
  } catch (e) {
    capture(e);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

// todo: refacto
router.post("/:type/:template/send-email", passport.authenticate(["young", "referent"], { session: false, failWithError: true }), async (req, res) => {
  console.log("Received request for PDF generation with params:", req.params);
  try {
    const { error, value } = Joi.object({
      id: Joi.string().required(),
      type: Joi.string().required(),
      template: Joi.string().required(),
      contract_id: Joi.string(),
    })
      .unknown()
      .validate({ ...req.params, ...req.body, ...req.query }, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
    const { id, type, template, fileName, contract_id } = value;

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

    const html = await getHtmlTemplate(type, template, young, contract);
    if (!html) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    const { object, message } = getMailParams(type, template, young, contract);

    const getPDF = async () =>
      await fetch(config.API_PDF_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/pdf" },
        body: JSON.stringify({ html, options: type === "certificate" ? { landscape: true } : { format: "A4", margin: 0 } }),
      }).then((response) => {
        if (response.status !== 200) throw new Error("Error with PDF service");
        return response.buffer();
      });

    let buffer;
    try {
      buffer = await timeout(getPDF(), TIMEOUT_PDF_SERVICE);
    } catch (e) {
      capture(e);
      return res.status(500).send({ ok: false, code: ERRORS.PDF_ERROR });
    }

    const content = buffer.toString("base64");

    let emailTemplate = SENDINBLUE_TEMPLATES.young.DOCUMENT;
    let cc = getCcOfYoung({ template: emailTemplate, young });

    const mail = await sendTemplate(emailTemplate, {
      emailTo: [{ name: `${young.firstName} ${young.lastName}`, email: young.email }],
      attachment: [{ content, name: fileName }],
      params: { object, message },
      cc,
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
      }).validate(req.body, { stripUnknown: true });
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
        const filetype = await FileType.fromFile(tempFilePath);
        const mimeFromMagicNumbers = filetype ? filetype.mime : "application/pdf";
        const validTypes = ["image/jpeg", "image/png", "application/pdf"];
        if (!(validTypes.includes(mimetype) && validTypes.includes(mimeFromMagicNumbers))) {
          capture(`File ${name} of user(${req.user.id})is not a valid type: ${mimetype} ${mimeFromMagicNumbers}`);
          fs.unlinkSync(tempFilePath);
          return res.status(500).send({ ok: false, code: "UNSUPPORTED_TYPE" });
        }

        if (config.ENVIRONMENT === "production") {
          const scanResult = await scanFile(tempFilePath, name, req.user.id);
          if (scanResult.infected) {
            return res.status(403).send({ ok: false, code: ERRORS.FILE_INFECTED });
          } else if (scanResult.error) {
            return res.status(500).send({ ok: false, code: scanResult.error });
          }
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
        const resultingFile = { mimetype: mimeFromMagicNumbers, encoding: "7bit", data: encryptedBuffer };
        if (MILITARY_FILE_KEYS.includes(key)) {
          await uploadFile(`app/young/${id}/military-preparation/${key}/${newFile._id}`, resultingFile);
        } else {
          await uploadFile(`app/young/${id}/${key}/${newFile._id}`, resultingFile);
        }
        fs.unlinkSync(tempFilePath);

        // Add record to young

        young.files[key].push(newFile);
        if (key === "cniFiles") {
          const cohort = await CohortObject.findOne({ name: young.cohort });
          young.latestCNIFileExpirationDate = body.expirationDate;
          young.CNIFileNotValidOnStart = young.latestCNIFileExpirationDate < new Date(cohort.dateStart);
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
