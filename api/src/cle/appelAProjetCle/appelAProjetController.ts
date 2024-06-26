import passport from "passport";
import express, { Response } from "express";
import { UserRequest } from "../../controllers/request";
import { AppelAProjetService } from "./appelAProjetService";
import { ERRORS } from "../../utils";
import { isSuperAdmin } from "snu-lib";
import { capture } from "../../sentry";
import { generateCSVStream } from "../../services/fileService";
import archiver from "archiver";
import { isFeatureAvailable } from "../../featureFlag/featureFlagService";
import { FeatureFlagName } from "../../models/featureFlagType";

const router = express.Router();
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
    try {
      const results: { name: string; data: any[] }[] = await new AppelAProjetService().sync();

      const archive = archiver("zip", { zlib: { level: 9 } });
      archive.pipe(res);

      for (const { name, data } of results) {
        const stream = generateCSVStream(data);
        archive.append(stream, { name: `${name}-simulation.csv` });
      }
      const fileName = `appelAProjet-simulate-${new Date().toISOString()?.replaceAll(":", "-")?.replace(".", "-")}.zip`;
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
    try {
      const results: { name: string; data: any[] }[] = await new AppelAProjetService().sync(true);

      const archive = archiver("zip", { zlib: { level: 9 } });
      archive.pipe(res);

      for (const { name, data } of results) {
        const stream = generateCSVStream(data);
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
