//See: https://developers.sendinblue.com/docs/how-to-use-webhooks

import express from "express";
import Joi from "joi";

import { ERRORS } from "../utils";
import { capture, captureMessage } from "../sentry";
import { EmailModel, EmailDocument } from "../models";
import { serializeEmail } from "../utils/serializer";
import { getEmailsList, getEmailContent } from "../brevo";
import { idSchema } from "../utils/validator";
import { RouteRequest, RouteResponse } from "./request";
import { PERMISSION_ACTIONS, PERMISSION_RESOURCES } from "snu-lib";
import { authMiddleware } from "../middlewares/authMiddleware";
import { requestValidatorMiddleware } from "../middlewares/requestValidatorMiddleware";
import { permissionAccessControlMiddleware } from "../middlewares/permissionAccessControlMiddleware";

const router = express.Router();

router.get(
  "/",
  authMiddleware("referent"),
  [
    requestValidatorMiddleware({ query: Joi.object({ email: Joi.string().lowercase().trim().email().required() }) }),
    permissionAccessControlMiddleware([{ resource: PERMISSION_RESOURCES.USER_NOTIFICATIONS, action: PERMISSION_ACTIONS.READ }]),
  ],
  async (req: RouteRequest<any>, res: RouteResponse<any>) => {
    try {
      const data = await EmailModel.find({ email: req.validatedQuery.email }).sort("-date");
      if (!data) {
        return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      }
      return res.status(200).send({ ok: true, data: data.map((e: EmailDocument) => serializeEmail(e)) });
    } catch (error) {
      capture(error);
    }
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  },
);

router.get(
  "/:id",
  authMiddleware("referent"),
  [
    requestValidatorMiddleware({ params: Joi.object({ id: idSchema().required() }) }),
    permissionAccessControlMiddleware([{ resource: PERMISSION_RESOURCES.USER_NOTIFICATIONS, action: PERMISSION_ACTIONS.READ }]),
  ],
  async (req: RouteRequest<any>, res: RouteResponse<any>) => {
    try {
      // Get email from db
      const mail = await EmailModel.findById(req.validatedParams.id);
      if (!mail) {
        captureMessage("Error finding email with id : " + JSON.stringify(req.validatedParams.id));
        return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      }

      const { email, messageId } = mail;

      if (!messageId) {
        captureMessage("Error: messageId is undefined for email with id : " + JSON.stringify(req.validatedParams.id));
        return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      }

      const year = messageId!.slice(1, 5);
      const month = messageId!.slice(5, 7);
      const day = messageId!.slice(7, 9);
      const formattedDate = `${year}-${month}-${day}`;

      const emails = await getEmailsList({ email, messageId, startDate: formattedDate, endDate: formattedDate });
      if (!emails?.count || emails.code) {
        captureMessage("Error while fetching email" + JSON.stringify({ emails, email, messageId, startDate: formattedDate, endDate: formattedDate }));
        return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      }

      const uuid = emails.transactionalEmails[0].uuid;

      const emailData = await getEmailContent(uuid);
      if (!emailData || emailData.code) {
        captureMessage("Error while fetching email" + JSON.stringify(emailData));
        return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      }
      return res.status(200).send({ ok: true, data: emailData });
    } catch (error) {
      capture(error);
      res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  },
);

export default router;
