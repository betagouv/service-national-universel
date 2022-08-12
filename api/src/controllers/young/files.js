const express = require("express");
const passport = require("passport");
const router = express.Router();
const Joi = require("joi");
const NodeClam = require("clamscan");
const fs = require("fs");
const FileType = require("file-type");
const fileUpload = require("express-fileupload");
const mongoose = require("mongoose");
const { decrypt, encrypt } = require("../../cryptoUtils");
const config = require("../../config");
const { capture } = require("../../sentry");
const YoungObject = require("../../models/young");
const { uploadFile, deleteFile, getFile, ERRORS } = require("../../utils");
const { serializeYoung } = require("../../utils/serializer");

router.post(
  "/:key",
  passport.authenticate("young", { session: false, failWithError: true }),
  fileUpload({ limits: { fileSize: 10 * 1024 * 1024 }, useTempFiles: true, tempFileDir: "/tmp/" }),
  async (req, res) => {
    try {
      const rootKeys = [
        "cniFiles",
        "highSkilledActivityProofFiles",
        "parentConsentmentFiles",
        "autoTestPCRFiles",
        "imageRightFiles",
        "dataProcessingConsentmentFiles",
        "rulesFiles",
        "equivalenceFiles",
      ];
      const militaryKeys = ["militaryPreparationFilesIdentity", "militaryPreparationFilesCensus", "militaryPreparationFilesAuthorization", "militaryPreparationFilesCertificate"];

      // Validate params & body
      const { error: keyError, value } = Joi.object({
        key: Joi.string().required(),
      })
        .unknown()
        .valid(...[...rootKeys, ...militaryKeys])
        .validate(req.params, { stripUnknown: true });
      if (keyError) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

      const { error: bodyError, value: body } = Joi.string().required().validate(req.body.body);
      if (bodyError) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });

      const user = await YoungObject.findById(req.user._id);
      if (!user) return res.status(404).send({ ok: false, code: ERRORS.USER_NOT_FOUND });

      // Validate files with Joi
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

      // Upload files: iterate over the list of files from the request,
      for (let currentFile of files) {
        // If multiple file with same names are provided, currentFile is an array. We just take the latest.
        if (Array.isArray(currentFile)) {
          currentFile = currentFile[currentFile.length - 1];
        }
        const { name, tempFilePath, mimetype, size } = currentFile;
        const { mime: mimeFromMagicNumbers } = await FileType.fromFile(tempFilePath);
        const validTypes = ["image/jpeg", "image/png", "application/pdf"];
        if (!(validTypes.includes(mimetype) && validTypes.includes(mimeFromMagicNumbers))) {
          fs.unlinkSync(tempFilePath);
          return res.status(500).send({ ok: false, code: "UNSUPPORTED_TYPE" });
        }

        if (config.ENVIRONMENT === "staging" || config.ENVIRONMENT === "production") {
          const clamscan = await new NodeClam().init({
            removeInfected: true,
          });
          const { isInfected } = await clamscan.isInfected(tempFilePath);
          if (isInfected) {
            fs.unlinkSync(tempFilePath);
            return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
          }
        }

        // Create document to embed in young record
        const newFile = {
          _id: mongoose.Types.ObjectId(),
          name,
          size,
          uploadedAt: Date.now(),
          mimetype,
        };
        // console.log("user:", user);
        console.log("newFile:", newFile);
        console.log("value.key:", value.key);
        console.log("user.files:", user.files);
        console.log("user.files[value.key]:", user.files[value.key]);
        user.files[value.key].push(newFile);

        // Upload file using ObjectId as file name
        const data = fs.readFileSync(tempFilePath);
        const encryptedBuffer = encrypt(data);
        const resultingFile = { mimetype: "image/png", encoding: "7bit", data: encryptedBuffer };
        if (militaryKeys.includes(value.key)) {
          await uploadFile(`app/young/${user._id}/military-preparation/${value.key}/${newFile._id}`, resultingFile);
        } else {
          await uploadFile(`app/young/${user._id}/${value.key}/${newFile._id}`, resultingFile);
        }
        fs.unlinkSync(tempFilePath);
      }

      // Save young with new docs & send back updated array of file docs
      await user.save({ fromUser: req.user });
      return res.status(200).send({ young: serializeYoung(user, user), data: user.files[value.key], ok: true });
    } catch (error) {
      capture(error);
      if (error === "FILE_CORRUPTED") return res.status(500).send({ ok: false, code: ERRORS.FILE_CORRUPTED });
      return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  },
);

router.delete("/:key/:fileId", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  try {
    // Validate
    const { error, value } = Joi.object({
      key: Joi.string().required(),
      fileId: Joi.string().required(),
    })
      .unknown()
      .validate(req.params, { stripUnknown: true });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    // Delete on s3

    if (value.key.includes("militaryPreparationFiles")) {
      const res = await deleteFile(`app/young/${value.young}/military-preparation/${value.key}/${value.fileId}`);
      console.log("res from router.delete:", res);
    } else {
      const res = await deleteFile(`app/young/${value.young}/${value.key}/${value.fileId}`);
      console.log("res from router.delete:", res);
    }

    // Retrieve young model and delete file record
    const user = await YoungObject.findById(req.user._id);
    user.files[value.key].id(value.fileId).remove();
    await user.save({ fromUser: req.user });

    return res.status(200).send({ data: user.files[value.key], ok: true });
  } catch (e) {
    console.error(e);
  }
});

router.get("/:key/:fileId", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      key: Joi.string().required(),
      fileId: Joi.string().required(),
    })
      .unknown()
      .validate({ ...req.params }, { stripUnknown: true });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const { key, fileId } = value;

    const user = await YoungObject.findById(req.user._id);
    if (!user) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    let downloaded = null;
    if (key.includes("militaryPreparationFiles")) {
      downloaded = await getFile(`app/young/${req.user._id}/military-preparation/${key}/${fileId}`);
    } else {
      downloaded = await getFile(`app/young/${req.user._id}/${key}/${fileId}`);
    }

    const decryptedBuffer = decrypt(downloaded.Body);
    return res.status(200).send({
      data: Buffer.from(decryptedBuffer, "base64"),
      mimeType: user.files[key].id(fileId).mimetype,
      fileName: user.files[key].id(fileId).name,
      ok: true,
    });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
