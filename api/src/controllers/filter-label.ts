import Joi from "joi";
import { ERRORS } from "snu-lib";
import passport from "passport";
import express, { Response } from "express";
import { ClasseModel, EtablissementModel, LigneBusModel, SessionPhase1Model } from "../models";
import { capture } from "../sentry";
import { UserRequest } from "./request";

const router = express.Router();

const listTypes = { INSCRIPTION: "inscription", VOLONTAIRES: "volontaires" };

const validator = Joi.string().valid(listTypes.INSCRIPTION, listTypes.VOLONTAIRES).required();

router.get("/:list", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
  const { value, error } = validator.validate(req.params.list);
  if (error) {
    capture(error);
    return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
  }

  if (value === listTypes.VOLONTAIRES) {
    const sessions = await SessionPhase1Model.find({}, { codeCentre: 1 });
    const bus = await LigneBusModel.find({}, { busId: 1 });
    const classes = await ClasseModel.find({}, { uniqueKeyAndId: 1 });
    // console.log("🚀 ~ router.get ~ classes:", classes);
    const etablissements = await EtablissementModel.find({}, { name: 1 });
    const data = { sessions, bus, classes, etablissements };
    return res.status(200).send({ ok: true, data });
  }
});

module.exports = router;
