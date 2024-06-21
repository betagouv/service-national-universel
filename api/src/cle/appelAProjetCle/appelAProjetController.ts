import passport from "passport";
import express, { Response } from "express";
import { UserRequest } from "../../controllers/request";
import { syncAppelAProjet } from "./appelAProjetService";
import { ERRORS } from "../../utils";
import { isSuperAdmin } from "snu-lib";
import { capture } from "../../sentry";
import { generateCSVStream } from "../../services/fileService";
import archiver from "archiver";

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
    try {
      const results: { name: string; data: any[] }[] = await syncAppelAProjet();

      const archive = archiver("zip", { zlib: { level: 9 } });
      archive.pipe(res);

      for (const { name, data } of results) {
        const stream = generateCSVStream(data);
        archive.append(stream, { name: `${name}.csv` });
      }
      const fileName = `appelAProjet-simulate-${new Date().toISOString()?.replaceAll(":", "-")?.replace(".", "-")}.zip`;
      console.log(fileName);
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
    try {
      // referent
      // etablissement
      // classe
    } catch (e) {
      capture(e);
      res.status(500).json({ error: e.message });
    }
  },
);
module.exports = router;
