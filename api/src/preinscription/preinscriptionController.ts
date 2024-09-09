import { calculateAge, ERRORS } from "snu-lib";
import { createLead } from "./preinscriptionService";
import express from "express";
import Joi from "joi";
import { capture } from "../sentry";
import { getFilteredSessions } from "../utils/cohort";

const router = express.Router({ mergeParams: true });

const schemaEligibility = {
  schoolDepartment: Joi.string().allow("", null),
  department: Joi.string(),
  region: Joi.string(),
  schoolRegion: Joi.string().allow("", null),
  birthdateAt: Joi.date().required(),
  grade: Joi.string(),
  status: Joi.string(),
  zip: Joi.string().allow("", null),
};

router.post("/eligibilite", async (req, res) => {
  try {
    const { error, value } = Joi.object(schemaEligibility).validate(req.body);

    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    const cohorts = await getFilteredSessions(value, req.headers["x-user-timezone"] as string);

    if (cohorts.length === 0) {
      return res.send({ ok: true, data: [], message: "no_session_found" });
    }

    return res.send({ ok: true, data: cohorts });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

const schemaLead = {
  email: Joi.string().email().required(),
  firstname: Joi.string().required(),
  lastname: Joi.string().required(),
  region: Joi.string().required(),
  birthdateAt: Joi.date().required(),
};

router.post("/create-lead", async (req, res) => {
  const { error, value } = Joi.object(schemaLead).validate(req.body);

  if (error) {
    return res.status(400).json({ ok: false, code: 400, message: ERRORS.INVALID_BODY });
  }

  if (calculateAge(value.birthdateAt, new Date()) > 18) {
    return res.status(400).json({ ok: false, code: 400, message: ERRORS.BAD_REQUEST });
  }

  try {
    const lead = await createLead(value);
    return res.status(201).json({ ok: true, code: 201, data: JSON.stringify(lead) });
  } catch (error) {
    capture(error);
    return res.status(500).json({ ok: false, code: 500, message: ERRORS.SERVER_ERROR });
  }
});
