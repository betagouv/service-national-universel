import express, { Response } from "express";
import passport from "passport";
import Joi from "joi";

import { SENDINBLUE_TEMPLATES, ERRORS } from "snu-lib";

import { capture } from "../../sentry";
import { UserRequest } from "../../controllers/request";

import { isReferent, isYoung } from "../../utils";
import { YoungModel } from "../../models";
import { canEditYoungInScope } from "../youngScope";
import { isTrustedEmailLink, sanitizeEmailText } from "../../email/emailInput";
import { userRateLimiter } from "../../middlewares/rateLimit";

import { sendEmailToYoung } from "./youngEmailService";

const router = express.Router();

// GOO-198 : un volontaire n'envoie plus jamais de gabarit depuis cette route (refus systématique
// ci-dessous). Le limiteur reste en défense en profondeur et compte aussi les tentatives refusées.
// Les référents envoient depuis l'admin : ils ne sont pas limités ici.
const youngEmailLimiter = userRateLimiter({ prefix: "young-email-template", windowMs: 60 * 60 * 1000, limit: 10 });
const limitYoung = (req: UserRequest, res: Response, next) => (isYoung(req.user) ? youngEmailLimiter(req, res, next) : next());

router.post("/:id/email/:template", passport.authenticate(["young", "referent"], { session: false, failWithError: true }), limitYoung, async (req: UserRequest, res: Response) => {
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

    // GOO-198 : la phase 1 n'existe plus, donc plus de fiche sanitaire à transmettre. Un volontaire
    // ne peut plus déclencher aucun gabarit sur cette route (l'ancienne exception sur young.LINK tombe).
    if (isYoung(req.user)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
    }

    // Le mail part de l'expéditeur officiel du SNU : seuls les liens du service y sont admis,
    // faute de quoi la route est un hameçonnage clé en main (constat M74).
    if (!isTrustedEmailLink(link) || !isTrustedEmailLink(cta)) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    // The young must exist.
    const young = await YoungModel.findById(id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    // If actor is a referent it must be allowed to send template.
    if (isReferent(req.user) && !(await canEditYoungInScope(req.user, young))) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
    }

    // Les textes libres sont recopiés dans le corps du mail : on en retire tout balisage.
    await sendEmailToYoung(template, young, {
      message: sanitizeEmailText(message),
      missionName: sanitizeEmailText(missionName),
      structureName: sanitizeEmailText(structureName),
      cta,
      type_document: sanitizeEmailText(type_document),
      object: sanitizeEmailText(object),
      link,
    });

    return res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

export default router;
