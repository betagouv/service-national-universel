const express = require("express");
const passport = require("passport");
const { capture } = require("../../sentry");
const { ERRORS } = require("../../utils");
const Joi = require("joi");
const { YOUNG_STATUS } = require("snu-lib");
const router = express.Router();
const YoungModel = require("../../models/young");

const filtersJoi = Joi.object({
  status: Joi.array().items(Joi.string().valid(...Object.values(YOUNG_STATUS))),
  region: Joi.array().items(Joi.string()),
  academy: Joi.array().items(Joi.string()),
  department: Joi.array().items(Joi.string()),
  cohorts: Joi.array().items(Joi.string()),
});

router.post("/volontaires-statuts-phase", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    // --- test body
    const { error, value } = Joi.object({
      filters: filtersJoi,
      phase: Joi.number().valid(1, 2, 3).required(),
    }).validate(req.body);
    if (error) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }
    const { filters, phase } = value;

    // --- get data
    let matchs = {};
    if (filters && filters.status && filters.status.length > 0) {
      matchs.status = { $in: filters.status };
    }
    if (filters && filters.region && filters.region.length > 0) {
      matchs.region = { $in: filters.region };
    }
    if (filters && filters.department && filters.department.length > 0) {
      matchs.department = { $in: filters.department };
    }
    if (filters && filters.academies && filters.academies.length > 0) {
      matchs.academy = { $in: filters.academies };
    }
    if (filters && filters.cohort && filters.cohort.length > 0) {
      matchs.cohort = { $in: filters.cohort };
    }

    const pipeline = [
      { $match: matchs },
      {
        $group: {
          _id: `$statusPhase${phase}`,
          count: { $sum: 1 },
        },
      },
    ];
    const data = await YoungModel.aggregate(pipeline);

    // --- result
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
