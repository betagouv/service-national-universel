const express = require("express");
const router = express.Router();
const { capture } = require("../sentry");
const Joi = require("joi");
const { db } = require("../postgresql");

router.post("/refresh", async (req, res) => {
  try {
    await db.query(`refresh materialized view logs_by_day_user_cohort_change_event;`);
    await db.query(`refresh materialized view logs_by_day_user_status_change_event;`);

    return res.status(200).send({ ok: true });
  } catch (error) {
    console.log("Error ", error);
    capture(error);
  }
});

router.post("/young-status/count", async (req, res) => {
  try {
    const { error, value } = Joi.object({
      region: Joi.array().items(Joi.string()),
      department: Joi.array().items(Joi.string()),
      status: Joi.string().valid("VALIDATED", "WAITING_VALIDATION", "WITHDRAWN").required(),
      startDate: Joi.string().regex(/^\d{4}-\d{2}-\d{2}$/).required(),
      endDate: Joi.string().regex(/^\d{4}-\d{2}-\d{2}$/).required(),
    }).validate(req.body); // xor('region', 'department').validate(req.body);

    if (error) {
      console.log(error);
      return res.status(400).send({ ok: false, code: "INVALID_PARAMS" });
    }

    // if (!value.region?.length && !value.department?.length) return res.status(400).send({ ok: false, code: "INVALID_PARAMS" });

    let result;
    if (value.region?.length) {
      result = await db.query(`
        select count (distinct young_id) from "public"."logs_by_day_user_status_change_event"
        where region in (:region) and value = :status
        and "date" between :startDate and :endDate::date + 1;`,
        {
          type: db.QueryTypes.SELECT,
          replacements: { region: value.region, status: value.status, cohort: value.cohort, startDate: value.startDate, endDate: value.endDate },
        }
      );
    } else if (value.department?.length) {
      result = await db.query(`
        select count (distinct young_id) from "public"."logs_by_day_user_status_change_event"
        where depatment in (:department) and value = :status
        and "date" between :startDate and :endDate::date + 1;`,
        {
          type: db.QueryTypes.SELECT,
          replacements: { department: value.department, status: value.status, cohort: value.cohort, startDate: value.startDate, endDate: value.endDate },
        }
      );
    } else {
      result = await db.query(`
        select count (distinct young_id) from "public"."logs_by_day_user_status_change_event"
        where value = :status
        and "date" between :startDate and :endDate::date + 1;`,
        {
          type: db.QueryTypes.SELECT,
          replacements: { status: value.status, cohort: value.cohort, startDate: value.startDate, endDate: value.endDate },
        }
      );
    }
    return res.status(200).send({ ok: true, data: result });
  } catch (error) {
    console.log("Error ", error);
    capture(error);
  }
});

router.post("/young-cohort/count", async (req, res) => {
  try {
    const { error, value } = Joi.object({
      region: Joi.array().items(Joi.string()),
      department: Joi.array().items(Joi.string()),
      startDate: Joi.string().regex(/^\d{4}-\d{2}-\d{2}$/).required(),
      endDate: Joi.string().regex(/^\d{4}-\d{2}-\d{2}$/).required(),
    }).validate(req.body); // xor('region', 'department').validate(req.body);

    if (error) {
      console.log(error);
      return res.status(400).send({ ok: false, code: "INVALID_PARAMS" });
    }

    let result;
    if (value.region?.length) {
      result = await db.query(`
        select count (distinct young_id) from "public"."logs_by_day_user_cohort_change_event"
        where region in (:region)
        and "date" between :startDate and :endDate::date + 1;`,
        {
          type: db.QueryTypes.SELECT,
          replacements: { region: value.region, cohort: value.cohort, startDate: value.startDate, endDate: value.endDate },
        }
      );
    } else if (value.department?.length) {
      result = await db.query(`
        select count (distinct young_id) from "public"."logs_by_day_user_cohort_change_event"
        where depatment in (:department)
        and "date" between :startDate and :endDate::date + 1;`,
        {
          type: db.QueryTypes.SELECT,
          replacements: { department: value.department, cohort: value.cohort, startDate: value.startDate, endDate: value.endDate },
        }
      );
    } else {
      result = await db.query(`
        select count (distinct young_id) from "public"."logs_by_day_user_cohort_change_event"
        and "date" between :startDate and :endDate::date + 1;`,
        {
          type: db.QueryTypes.SELECT,
          replacements: { cohort: value.cohort, startDate: value.startDate, endDate: value.endDate },
        }
      );
    }
    return res.status(200).send({ ok: true, data: result });
  } catch (error) {
    console.log("Error ", error);
    capture(error);
  }
});

module.exports = router;
