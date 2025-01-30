import Joi from "joi";
import { ERRORS } from "snu-lib";
import passport from "passport";
import express, { Response } from "express";
import { capture } from "../sentry";
import { UserRequest } from "../controllers/request";
import { getLabelVolontaires, listTypes } from "./filterLabelService";

const router = express.Router();

const validator = Joi.string().valid(listTypes.INSCRIPTION, listTypes.VOLONTAIRES).required();

router.get("/:list", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
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
});

module.exports = router;
