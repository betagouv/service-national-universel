import express from "express";
import passport from "passport";
import { UserRequest } from "../../controllers/request";
import { UpdateReferentClasse } from "../classe/classeService";
import { capture } from "../../sentry";
import { isSuperAdmin } from "snu-lib";
import { ERRORS } from "../../utils";
import Joi from "joi";
import { updateReferentsForMultipleClasses } from "./classesService";

const router = express.Router();

router.put("/update-referents", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res) => {
  try {
    if (!isSuperAdmin(req.user)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }
    const { error, value: referentsClassesToUpdate } = Joi.array<(UpdateReferentClasse & { idClasse: string })[]>()
      .items(
        Joi.object({
          idClasse: Joi.string().required(),
          firstName: Joi.string().required(),
          lastName: Joi.string().required(),
          email: Joi.string().email().required(),
        }),
      )
      .validate(req.body);
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
    const report = await updateReferentsForMultipleClasses(referentsClassesToUpdate, req.user);
    return res.status(200).json({ ok: true, data: report });
  } catch (error) {
    capture(error);
    res.status(422).send({ ok: false, code: error.message });
  }
});
export default router;
