import express from "express";
import passport from "passport";
import Joi from "joi";
import { capture } from "../../sentry";
import { YoungModel } from "../../models";
import { ERRORS } from "../../utils";
import { canEditYoung } from "snu-lib";
import { validateId, validatePhase2Preference } from "../../utils/validator";
import { MILITARY_PREPARATION_FILES_STATUS } from "snu-lib";
import { UserRequest } from "../request";
import { notifyReferentMilitaryPreparationFilesSubmitted } from "../../application/applicationNotificationService";

const router = express.Router({ mergeParams: true });

router.use("/equivalence", require("../../equivalence/equivalenceController"));

router.put("/militaryPreparation/status", passport.authenticate(["young", "referent"], { session: false, failWithError: true }), async (req: UserRequest, res) => {
  try {
    const { error, value } = Joi.object({
      id: Joi.string().required(),
      statusMilitaryPreparationFiles: Joi.string()
        .required()
        .valid(
          MILITARY_PREPARATION_FILES_STATUS.WAITING_VERIFICATION,
          MILITARY_PREPARATION_FILES_STATUS.WAITING_CORRECTION,
          MILITARY_PREPARATION_FILES_STATUS.VALIDATED,
          MILITARY_PREPARATION_FILES_STATUS.REFUSED,
        ),
    }).validate(
      {
        ...req.params,
        ...req.body,
      },
      { stripUnknown: true },
    );
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY, error });
    }

    const young = await YoungModel.findById(value.id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.YOUNG_NOT_FOUND });

    young.set({ statusMilitaryPreparationFiles: value.statusMilitaryPreparationFiles });

    if (value.statusMilitaryPreparationFiles === MILITARY_PREPARATION_FILES_STATUS.WAITING_VERIFICATION) {
      await notifyReferentMilitaryPreparationFilesSubmitted(young);
    }

    await young.save({ fromUser: req.user });
    res.status(200).send({ ok: true, data: young });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/preference", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res) => {
  try {
    const { error: errorId, value: checkedId } = validateId(req.params.id);
    const { error: errorBody, value: checkedBody } = validatePhase2Preference(req.body);
    if (errorId || errorBody) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const young = await YoungModel.findById(checkedId);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (!canEditYoung(req.user, young)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }
    young.set(checkedBody);
    await young.save({ fromUser: req.user });

    return res.status(200).send({ ok: true, data: young });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
