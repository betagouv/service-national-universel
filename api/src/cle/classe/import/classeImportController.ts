import passport from "passport";
import express from "express";

import { FeatureFlagName, isSuperAdmin } from "snu-lib";
import { ERRORS, uploadFile } from "../../../utils";
import { UserRequest } from "../../../controllers/request";

import { isFeatureAvailable } from "../../../featureFlag/featureFlagService";

import { importClasseCohort } from "./classeImportService";
import Joi from "joi";
import { capture } from "../../../sentry";
import { ClasseCohortImportBody, ClasseCohortImportKey } from "./classeCohortImport";
import { generateCSVStream } from "../../../services/fileService";

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
  }).validate(req.body, { stripUnknown: true });
  if (error) {
    capture(error);
    return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
  }

  if (!(await isFeatureAvailable(FeatureFlagName.CLE_IMPORT_CLASSE_COHORT))) {
    return res.status(422).send({ ok: false, code: ERRORS.FEATURE_NOT_AVAILABLE });
  }

  try {
    const importedClasseCohort = await importClasseCohort(value.filePath, value.classeCohortImportKey);
    const timestamp = `${new Date().toISOString()?.replaceAll(":", "-")?.replace(".", "-")}`;

    uploadFile(`file/appelAProjet/import/${timestamp}-imported-classes-cohorts.csv`, {
      data: generateCSVStream(importedClasseCohort),
      encoding: "",
      mimetype: "text/csv",
    });
    return res.status(200).send({ ok: true, data: importedClasseCohort });
  } catch (error) {
    capture(error);
    return res.status(422).send({ ok: false, code: error.message });
  }
});

export default router;
