import { calculateAge, ERRORS, PreinscriptionRoutes } from "snu-lib";
import express from "express";
import Joi from "joi";

import { capture } from "../sentry";
import { getFilteredSessions } from "../utils/cohort";
import { createContact } from "../brevo";
import { requestValidatorMiddleware } from "../middlewares/requestValidatorMiddleware";
import { RouteRequest, RouteResponse } from "../controllers/request";
import { PreinscriptionRoutesSchema } from "./preinscriptionValidator";

const router = express.Router({ mergeParams: true });

router.post(
  "/eligibilite",
  requestValidatorMiddleware(PreinscriptionRoutesSchema["PostEligibility"]),
  async (req: RouteRequest<PreinscriptionRoutes["PostEligibility"]>, res: RouteResponse<PreinscriptionRoutes["PostEligibility"]>) => {
    try {
      const cohorts = await getFilteredSessions(req.validatedBody, Number(req.headers["x-user-timezone"]) || null);

      return res.json({ ok: true, data: cohorts });
    } catch (error) {
      capture(error);
      res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  },
);

const schemaLead = Joi.object({
  email: Joi.string().email().required(),
  region: Joi.string().allow("", null),
  isAbroad: Joi.boolean().allow(null),
  birthdate: Joi.date().required(),
});

router.post("/create-lead", async (req, res) => {
  const { error, value } = schemaLead.validate(req.body);

  if (error) {
    capture(error);
    return res.status(400).json({ ok: false, code: 400, message: ERRORS.INVALID_BODY });
  }

  if (!value.isAbroad && !value.region) {
    capture(new Error("Region is required"));
    return res.status(400).json({ ok: false, code: 400, message: ERRORS.BAD_REQUEST });
  }

  if (calculateAge(value.birthdate, new Date()) > 18) {
    capture(new Error("User is too old"));
    return res.status(422).json({ ok: false, code: 400, message: ERRORS.BAD_REQUEST });
  }

  try {
    const data = await createContact({
      email: value.email,
      listIds: [706],
      attributes: {
        REGION: value.region,
      },
    });
    return res.status(201).json({ ok: true, code: 201, data });
  } catch (error) {
    capture(error);
    return res.status(500).json({ ok: false, code: 500, message: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
