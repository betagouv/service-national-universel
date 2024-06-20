import passport from "passport";
import express, { Response } from "express";
import { UserRequest } from "../../controllers/request";
import { syncAppelAProjet } from "./appelAProjetService";
import { ERRORS } from "../../utils";
import { isSuperAdmin } from "snu-lib";
import { capture } from "../../sentry";
import Joi from "joi";

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
      const { error, value } = Joi.object({
        schoolYear: Joi.string().required(),
      }).validate(req.body);

      if (error) {
        return res.status(400).send({ ok: false, code: ERRORS.INVALID_REQUEST });
      }

      const appelAProjet = await syncAppelAProjet(value.schoolYear);
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
