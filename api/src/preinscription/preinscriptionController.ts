import { calculateAge, ERRORS } from "snu-lib";
import express from "express";
import Joi from "joi";
import { capture } from "../sentry";
import { getFilteredSessions } from "../utils/cohort";
import { createContact } from "../brevo";

const router = express.Router({ mergeParams: true });

const schemaEligibilite = Joi.object({
  schoolDepartment: Joi.string().allow("", null),
  department: Joi.string(),
  region: Joi.string(),
  schoolRegion: Joi.string().allow("", null),
  birthdateAt: Joi.date().required(),
  grade: Joi.string(),
  status: Joi.string(),
  zip: Joi.string().allow("", null),
  isReInscription: Joi.boolean().required(),
});

router.post("/eligibilite", async (req, res) => {
  const { error, value } = schemaEligibilite.validate(req.body);

  if (error) {
    capture(error);
    return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
  }

  try {
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
    return res.status(201).json({ ok: true, code: 201, data: JSON.stringify(data) });
  } catch (error) {
    capture(error);
    return res.status(500).json({ ok: false, code: 500, message: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
