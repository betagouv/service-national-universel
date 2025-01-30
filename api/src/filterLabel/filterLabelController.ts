import Joi from "joi";
import { ERRORS } from "snu-lib";
import passport from "passport";
import express, { Response } from "express";
import { capture } from "../sentry";
import { UserRequest } from "../controllers/request";
import { getLabelVolontaires, listTypes } from "./filterLabelService";

const router = express.Router();

const validator = Joi.string().valid(listTypes.INSCRIPTION, listTypes.VOLONTAIRES).required();

router.get("/:list", passport.authenticate("referent", { session: false, failWithError: true }), GetFilterLabels);

async function GetFilterLabels(req: UserRequest, res: Response) {
  try {
    const { value, error } = validator.validate(req.params.list);
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    if (value === listTypes.VOLONTAIRES) {
      const data = await getLabelVolontaires();
      return res.status(200).send({ ok: true, data });
    }

    // TODO: getLabelInscriptions
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
}

module.exports = router;
