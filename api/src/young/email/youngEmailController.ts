import express, { Response } from "express";
import passport from "passport";
import Joi from "joi";

import { SENDINBLUE_TEMPLATES, ERRORS, canSendTemplateToYoung } from "snu-lib";

import { capture } from "../../sentry";
import { UserRequest } from "../../controllers/request";

import { isReferent, isYoung } from "../../utils";
import { YoungModel } from "../../models";

import { sendEmailToYoung } from "./youngEmailService";

const router = express.Router();

router.post("/:id/email/:template", passport.authenticate(["young", "referent"], { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
  try {
    const { error, value } = Joi.object({
      id: Joi.string().required(),
      template: Joi.string().required(),
      message: Joi.string().allow(null, ""),
      prevStatus: Joi.string().allow(null, ""),
      missionName: Joi.string().allow(null, ""),
      structureName: Joi.string().allow(null, ""),
      cta: Joi.string().allow(null, ""),
      type_document: Joi.string().allow(null, ""),
      object: Joi.string().allow(null, ""),
      link: Joi.string().allow(null, ""),
    })
      .unknown()
      .validate({ ...req.params, ...req.body }, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
    // eslint-disable-next-line no-unused-vars
    const { id, template, message, prevStatus, missionName, structureName, cta, type_document, object, link } = value;

    // The template must exist.
    if (!Object.values(SENDINBLUE_TEMPLATES.young).includes(template) && !Object.values(SENDINBLUE_TEMPLATES.parent).includes(template)) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    // The young must exist.
    const young = await YoungModel.findById(id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    // If actor is a young it must be the same as the young.
    if (isYoung(req.user) && young._id.toString() !== req.user._id.toString()) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
    }

    // If actor is a referent it must be allowed to send template.
    if (isReferent(req.user) && !canSendTemplateToYoung(req.user, young)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
    }

    await sendEmailToYoung(template, young, { message, missionName, structureName, cta, type_document, object, link });

    return res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

export default router;
