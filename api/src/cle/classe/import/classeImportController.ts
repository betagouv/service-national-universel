import passport from "passport";
import express from "express";
import fileUpload from "express-fileupload";
import { UploadedFile } from "express-fileupload";
import xlsx from "xlsx";

import { FeatureFlagName, isSuperAdmin } from "snu-lib";
import { ERRORS, uploadFile } from "../../../utils";
import { UserRequest } from "../../../controllers/request";
import { readCSVBuffer } from "../../../services/fileService";

import { isFeatureAvailable } from "../../../featureFlag/featureFlagService";

import { importClasseCohort, importClasseCohortBIS } from "./classeImportService";
import Joi from "joi";
import { capture } from "../../../sentry";
import { ClasseCohortImportBody, ClasseCohortImportKey, ClasseImportType, ClasseCohortCSV } from "./classeCohortImport";
import { generateCSVStream, getHeaders } from "../../../services/fileService";

const router = express.Router();

router.post("/classe-cohort", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res) => {
  if (!isSuperAdmin(req.user)) {
    return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
  }

  const { error, value } = Joi.object<ClasseCohortImportBody>({
    filePath: Joi.string().required(),
    classeCohortImportKey: Joi.string()
      .valid(...Object.values(ClasseCohortImportKey))
      .required(),
    importType: Joi.string()
      .valid(...Object.values(ClasseImportType))
      .required(),
  }).validate(req.body, { stripUnknown: true });
  if (error) {
    capture(error);
    return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
  }

  if (!(await isFeatureAvailable(FeatureFlagName.CLE_IMPORT_CLASSE_COHORT))) {
    return res.status(422).send({ ok: false, code: ERRORS.FEATURE_NOT_AVAILABLE });
  }

  try {
    const importedClasseCohort = await importClasseCohort(value.filePath, value.classeCohortImportKey, value.importType);
    const timestamp = `${new Date().toISOString()?.replaceAll(":", "-")?.replace(".", "-")}`;

    const headers = getHeaders(importedClasseCohort);
    uploadFile(`file/appelAProjet/import/${timestamp}-imported-classes-cohorts.csv`, {
      data: generateCSVStream(importedClasseCohort, headers),
      encoding: "",
      mimetype: "text/csv",
    });
    return res.status(200).send({ ok: true, data: importedClasseCohort });
  } catch (error) {
    capture(error);
    return res.status(422).send({ ok: false, code: error.message });
  }
});

router.post(
  "/classe-import",
  passport.authenticate("referent", { session: false, failWithError: true }),
  fileUpload({ limits: { fileSize: 5 * 1024 * 1024 }, useTempFiles: true, tempFileDir: "/tmp/" }),
  async (req: UserRequest, res) => {
    if (!isSuperAdmin(req.user)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    try {
      const files = Object.values(req.files || {});
      if (files.length === 0) {
        return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
      }
      const file: UploadedFile = files[0];
      const filePath = file.tempFilePath;
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const csvData = xlsx.utils.sheet_to_csv(worksheet, { FS: "," });
      const csvBuffer = Buffer.from(csvData);
      const parsedContent: ClasseCohortCSV[] = await readCSVBuffer(csvBuffer);

      const importedClasseCohort = await importClasseCohortBIS(parsedContent);
      const timestamp = `${new Date().toISOString()?.replaceAll(":", "-")?.replace(".", "-")}`;

      const headers = getHeaders(importedClasseCohort);
      uploadFile(`file/appelAProjet/import/${timestamp}-imported-classes-cohorts.csv`, {
        data: generateCSVStream(importedClasseCohort, headers),
        encoding: "",
        mimetype: "text/csv",
      });
      /*           if (exportKey === EXPORT_YOUNGS_AFTER_SESSION) {
            file = await getFile(`dsnj/${cohort.snuId}/${EXPORT_YOUNGS_AFTER_SESSION}.xlsx`);
            fileName = `DSNJ - Fichier volontaire avec validation-${cohort.snuId}-${formattedDate}.xlsx`;
          }

          const decryptedBuffer = decrypt(file.Body) as any;

          return res.status(200).send({
            data: Buffer.from(decryptedBuffer, "base64"),
            mimeType: xlsxMimetype,
            fileName,
            ok: true,
          }); */
      return res.status(200).send({ ok: true, data: importedClasseCohort });
    } catch (error) {
      capture(error);
      return res.status(422).send({ ok: false, code: error.message });
    }
  },
);

export default router;
