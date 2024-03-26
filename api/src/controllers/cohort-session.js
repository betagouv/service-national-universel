const express = require("express");
const router = express.Router();
const Joi = require("joi");
const { capture } = require("../sentry");
const { ERRORS } = require("../utils");
const { getFilteredSessions, getAllSessions, getFilteredSessionsForCLE } = require("../utils/cohort");
const { validateId } = require("../utils/validator");
const YoungModel = require("../models/young");
const CohortModel = require("../models/cohort");
const passport = require("passport");
const { ROLES } = require("snu-lib");
const { ADMIN_URL } = require("../config");

// Takes either a young ID in route parameter or young data in request body (for edition or signup pages).
// Minimum data required: birthdateAt, zip || department and (if schooled) grade.
// If user is an admin, returns all sessions.
// If not, returns an array of session objects filtered by eligibility rules and inscription dates.
// Provides updated number of places in the given region for frontend filtering and backend coherence checks.

router.post("/eligibility/2023/:id?", async (req, res) => {
  passport.authenticate("referent", async function (err, user) {
    try {
      let young = {};
      const { value } = validateId(req.params.id);
      if (value) young = await YoungModel.findById(value);
      else {
        const { error: bodyError, value: body } = Joi.object({
          schoolDepartment: Joi.string().allow("", null),
          department: Joi.string(),
          region: Joi.string(),
          schoolRegion: Joi.string().allow("", null),
          birthdateAt: Joi.date().required(),
          grade: Joi.string(),
          status: Joi.string(),
          zip: Joi.string().allow("", null),
        })
          .unknown()
          .validate(req.body);
        if (bodyError) {
          capture(bodyError);
          return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
        }
        young = body;
      }
      const { error: errorParams, value: params } = Joi.object({
        getAllSessions: Joi.boolean().default(false),
      })
        .unknown()
        .validate(req.query, { stripUnknown: true });

      if (errorParams) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

      const bypassFilter =
        (user?.role === ROLES.ADMIN && req.get("origin") === ADMIN_URL) || ([ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(user?.role) && params.getAllSessions);
      const defaultSession = { name: "à venir", type: "VOLONTAIRE" };
      const sessions = [ROLES.REFERENT_CLASSE, ROLES.ADMINISTRATEUR_CLE].includes(user?.role)
        ? await getFilteredSessionsForCLE()
        : bypassFilter
          ? await getAllSessions(young)
          : await getFilteredSessions(young, req.headers["x-user-timezone"] || null);
      sessions.push(defaultSession);
      return res.send({ ok: true, data: sessions });
    } catch (error) {
      capture(error);
      res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  })(req, res);
});

router.get("/isInscriptionOpen", async (req, res) => {
  const { error, value } = Joi.object({
    sessionName: Joi.string(),
  })
    .unknown()
    .validate(req.query, { stripUnknown: true });

  if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
  const { sessionName: cohortName } = value;

  const userTimezoneOffsetInMilliseconds = req.headers["x-user-timezone"] * 60 * 1000; // User's offset from UTC

  // Adjust server's time for user's timezone
  const adjustedTimeForUser = new Date().getTime() - userTimezoneOffsetInMilliseconds;
  const now = new Date(adjustedTimeForUser);

  try {
    if (cohortName) {
      const cohort = await CohortModel.findOne({ name: cohortName });
      if (!cohort) return res.status(400).send({ ok: true, data: false });
      return res.send({ ok: true, data: now > new Date(cohort.inscriptionStartDate) && now < new Date(cohort.inscriptionEndDate) });
    }
    const cohorts = await CohortModel.find({});
    return res.send({
      ok: true,
      data: cohorts.some((cohort) => now > new Date(cohort.inscriptionStartDate) && now < new Date(cohort.inscriptionEndDate)),
    });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
