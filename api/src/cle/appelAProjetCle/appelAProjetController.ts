import passport from "passport";
import express, { Response } from "express";
import { UserRequest } from "../../controllers/request";
import { syncAppelAProjet } from "./appelAProjetService";
import { ERRORS } from "../../utils";
import { isSuperAdmin } from "snu-lib";
import { capture } from "../../sentry";

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
      const appelAProjet = await syncAppelAProjet();
      res.status(200).send({ ok: true, data: appelAProjet });
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
