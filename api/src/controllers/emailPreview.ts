import express from "express";
import passport from "passport";
import Joi from "joi";

import { capture } from "../sentry";
import { BrevoApiError, BrevoEmailTemplate, getPreviewTemplate } from "../brevo";
import { ERRORS } from "../utils";
import { UserRequest } from "./request";
import { isSuperAdmin } from "snu-lib";

const router = express.Router();

/**
 * Permet de prévisualiser un template email
 */
router.get("/template/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res) => {
  try {
    const { error, value } = Joi.object({
      id: Joi.string().required(),
    }).validate(req.params);

    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    // TODO At the moment, only the super admin can access this route.
    // You need to add a new condition to allow another role, enabling other users to access this route.
    if (!isSuperAdmin(req.user)) return res.status(403).send({ ok: false, code: ERRORS.FORBIDDEN });

    const { id: templateId } = value;

    const templateContent = await getPreviewTemplate(templateId);

    if ((templateContent as BrevoApiError).code !== undefined) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    return res.status(200).send({ ok: true, data: { html: (templateContent as BrevoEmailTemplate)?.htmlContent || "" } });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

export default router;
