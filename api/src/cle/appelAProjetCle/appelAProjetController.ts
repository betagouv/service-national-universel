import passport from "passport";
import express, { Response } from "express";
import { UserRequest } from "@/controllers/request";
import { syncAppelAProjet } from "@/cle/appelAProjetCle/appelAProjetService";

const router = express.Router();
router.post(
  "/simulate",
  passport.authenticate(["referent"], {
    session: false,
    failWithError: true,
  }),

  async (req: UserRequest, res: Response) => {
    try {
      const appelAProjet = await syncAppelAProjet();
      res.status(200).send({ ok: true, data: appelAProjet });
    } catch (e) {
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
    try {
      // referent
      // etablissement
      // classe
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },
);
module.exports = router;
