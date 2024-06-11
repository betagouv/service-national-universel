import express, { Response } from "express";
import passport from "passport";
import { UserRequest } from "@/controllers/request";

const router = express.Router();
router.post(
  "/simulate",
  passport.authenticate(["referent"], {
    session: false,
    failWithError: true,
  }),

  async (req: UserRequest, res: Response) => {
    try {
      //
    } catch (e) {
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
