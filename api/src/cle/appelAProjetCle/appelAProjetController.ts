import passport from "passport";
import express, { Response } from "express";
import Joi from "joi";
import { UserRequest } from "../../controllers/request";
import { AppelAProjetService } from "./appelAProjetService";
import { ERRORS } from "../../utils";
import { isSuperAdmin } from "snu-lib";
import { capture } from "../../sentry";
import { generateCSVStream } from "../../services/fileService";
import archiver from "archiver";
import { isFeatureAvailable } from "../../featureFlag/featureFlagService";
import { FeatureFlagName } from "../../models/featureFlag";
import { uploadFile } from "../../utils";

const router = express.Router();

const validateAppelAProjetPayload = (body) =>
  Joi.object({
    fixes: Joi.array().items(
      Joi.object({
        numberDS: Joi.number().required(),
        etablissement: Joi.object({
          uai: Joi.string(),
        }),
        useExistingEtablissement: Joi.boolean(),
      }),
    ),
    filters: Joi.array(),
  }).validate(body);

router.post(
  "/simulate",
  passport.authenticate(["referent"], {
    session: false,
    failWithError: true,
  }),

  async (req: UserRequest, res: Response) => {
    if (!isSuperAdmin(req.user)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }
    if (!(await isFeatureAvailable(FeatureFlagName.SYNC_APPEL_A_PROJET_CLE))) {
      return res.status(422).send({ ok: false, code: ERRORS.FEATURE_NOT_AVAILABLE });
    }
    const { error, value: payload } = validateAppelAProjetPayload(req.body);
    if (error) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }
    try {
      const results: { name: string; data: any[] }[] = await new AppelAProjetService().sync(false, payload);

      const archive = archiver("zip", { zlib: { level: 9 } });
      archive.pipe(res);

      const timestamp = `${new Date().toISOString()?.replaceAll(":", "-")?.replace(".", "-")}`;
      for (const { name, data } of results) {
        const stream = generateCSVStream(data);
        const file = {
          data: stream,
          encoding: "",
          mimetype: "text/csv",
        };
        uploadFile(`file/appelAProjet/${timestamp}-${name}-simulate.csv`, file);
        archive.append(stream, { name: `${name}-simulate.csv` });
      }
      const fileName = `appelAProjet-simulate-${timestamp}.zip`;
      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
      archive.finalize();
    } catch (e) {
      capture(e);
      console.error(e);
      res.status(500).json({ error: e.message });
    }
  },
);

router.post(
  "/real",
  passport.authenticate(["referent"], {
    session: false,
    failWithError: true,
  }),

  async (req: UserRequest, res: Response) => {
    if (!isSuperAdmin(req.user)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }
    if (!(await isFeatureAvailable(FeatureFlagName.SYNC_APPEL_A_PROJET_CLE))) {
      return res.status(422).send({ ok: false, code: ERRORS.FEATURE_NOT_AVAILABLE });
    }
    const { error, value: payload } = validateAppelAProjetPayload(req.body);
    if (error) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }
    try {
      const results: { name: string; data: any[] }[] = await new AppelAProjetService().sync(true, payload);

      const archive = archiver("zip", { zlib: { level: 9 } });
      archive.pipe(res);

      const timestamp = `${new Date().toISOString()?.replaceAll(":", "-")?.replace(".", "-")}`;
      for (const { name, data } of results) {
        const stream = generateCSVStream(data);
        const file = {
          data: stream,
          encoding: "",
          mimetype: "text/csv",
        };
        uploadFile(`file/appelAProjet/${timestamp}-${name}-real.csv`, file);
        archive.append(stream, { name: `${name}-real.csv` });
      }
      const fileName = `appelAProjet-real-${new Date().toISOString()?.replaceAll(":", "-")?.replace(".", "-")}.zip`;
      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
      archive.finalize();
    } catch (e) {
      capture(e);
      res.status(500).json({ error: e.message });
    }
  },
);
module.exports = router;
