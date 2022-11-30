const express = require("express");
const router = express.Router();
const Joi = require("joi");
const { capture } = require("../sentry");
const { ERRORS } = require("../utils");
const { getAvailableSessions, getAllSessions } = require("../utils/cohort");
const { validateId } = require("../utils/validator");
const YoungModel = require("../models/young");
const passport = require("passport");
const { ROLES } = require("snu-lib");

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
          schoolDepartment: Joi.string(),
          department: Joi.string(),
          schoolRegion: Joi.string(),
          region: Joi.string(),
          birthdateAt: Joi.date().required(),
          grade: Joi.string(),
          status: Joi.string(),
          zip: Joi.string(),
        })
          .unknown()
          .validate(req.body);
        if (bodyError) {
          capture(bodyError);
          return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
        }
        young = body;
      }

      const sessions = user.role === ROLES.ADMIN ? await getAllSessions(young) : await getAvailableSessions(young);
      if (sessions.length === 0) return res.send({ ok: true, data: { msg: "Sont éligibles les volontaires âgés de 15 à 17 ans au moment du SNU." } });
      return res.send({ ok: true, data: sessions });
    } catch (error) {
      capture(error);
      res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  })(req, res);
});

module.exports = router;
