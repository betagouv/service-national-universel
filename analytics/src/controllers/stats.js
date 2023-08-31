const express = require("express");
const router = express.Router();
const { capture } = require("../sentry");
const Joi = require("joi");
const { db } = require("../postgresql");

// Les vues matérialisées doivent être rafraîchies manuellement.
// Un cron tourne tous les jours à 5h du matin pour rafraîchir les vues matérialisées (environ 2 minutes par vue)
router.post("/refresh", async (req, res) => {
  try {
    await db.query(`refresh materialized view logs_by_day_user_cohort_change_event;`);
    await db.query(`refresh materialized view logs_by_day_user_status_change_event;`);
    await db.query(`refresh materialized view logs_by_day_application_status_change_event;`);

    return res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    console.log(error);
    res.status(500).send({ ok: false, code: "Error in refresh" });
  }
});

// Compter les jeunes qui ont changé de statut dans une période
// Pour 1..n départements ou 1..n régions ou au global
router.post("/young-status/count", async (req, res) => {
  try {
    const { error, value } = Joi.object({
      region: Joi.array().items(Joi.string()),
      department: Joi.array().items(Joi.string()),
      status: Joi.string().valid("VALIDATED", "WAITING_VALIDATION", "WITHDRAWN").required(),
      startDate: Joi.string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .required(),
      endDate: Joi.string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .required(),
    })
      .oxor("region", "department")
      .validate(req.body);

    if (error) {
      console.log(error);
      return res.status(400).send({ ok: false, code: "INVALID_PARAMS" });
    }

    let result;
    if (value.region?.length) {
      result = await db.query(
        `
        select count (distinct young_id) from "public"."logs_by_day_user_status_change_event"
        where region in (:region) and value = :status
        and "date" between :startDate and :endDate::date + 1;`,
        {
          type: db.QueryTypes.SELECT,
          replacements: { region: value.region, status: value.status, cohort: value.cohort, startDate: value.startDate, endDate: value.endDate },
        }
      );
    } else if (value.department?.length) {
      result = await db.query(
        `
        select count (distinct young_id) from "public"."logs_by_day_user_status_change_event"
        where department in (:department) and value = :status
        and "date" between :startDate and :endDate::date + 1;`,
        {
          type: db.QueryTypes.SELECT,
          replacements: { department: value.department, status: value.status, cohort: value.cohort, startDate: value.startDate, endDate: value.endDate },
        }
      );
    } else {
      result = await db.query(
        `
        select count (distinct young_id) from "public"."logs_by_day_user_status_change_event"
        where value = :status
        and "date" between :startDate and :endDate::date + 1;`,
        {
          type: db.QueryTypes.SELECT,
          replacements: { status: value.status, cohort: value.cohort, startDate: value.startDate, endDate: value.endDate },
        }
      );
    }
    return res.status(200).send({ ok: true, data: result[0] });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: "Error in young-status" });
  }
});

// Compter les jeunes qui ont changé de cohorte dans une période
// Pour 1..n départements ou 1..n régions ou au global
router.post("/young-cohort/count", async (req, res) => {
  try {
    const { error, value } = Joi.object({
      region: Joi.array().items(Joi.string()),
      department: Joi.array().items(Joi.string()),
      startDate: Joi.string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .required(),
      endDate: Joi.string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .required(),
    })
      .oxor("region", "department")
      .validate(req.body);

    if (error) {
      console.log(error);
      return res.status(400).send({ ok: false, code: "INVALID_PARAMS" });
    }

    let result;
    if (value.region?.length) {
      result = await db.query(
        `
        select count (distinct young_id) from "public"."logs_by_day_user_cohort_change_event"
        where region in (:region)
        and "date" between :startDate and :endDate::date + 1;`,
        {
          type: db.QueryTypes.SELECT,
          replacements: { region: value.region, cohort: value.cohort, startDate: value.startDate, endDate: value.endDate },
        }
      );
    } else if (value.department?.length) {
      result = await db.query(
        `
        select count (distinct young_id) from "public"."logs_by_day_user_cohort_change_event"
        where department in (:department)
        and "date" between :startDate and :endDate::date + 1;`,
        {
          type: db.QueryTypes.SELECT,
          replacements: { department: value.department, cohort: value.cohort, startDate: value.startDate, endDate: value.endDate },
        }
      );
    } else {
      result = await db.query(
        `
        select count (distinct young_id) from "public"."logs_by_day_user_cohort_change_event"
        and "date" between :startDate and :endDate::date + 1;`,
        {
          type: db.QueryTypes.SELECT,
          replacements: { cohort: value.cohort, startDate: value.startDate, endDate: value.endDate },
        }
      );
    }
    return res.status(200).send({ ok: true, data: result[0] });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: "Error in young-cohort" });
  }
});

router.post("/mission-change-status/count", async (req, res) => {
  try {
    const { error, value } = Joi.object({
      status: Joi.array().items(Joi.string().valid("DRAFT", "WAITING_VALIDATION", "WAITING_CORRECTION", "VALIDATED", "REFUSED", "CANCEL", "ARCHIVED").required()),
      department: Joi.array().items(Joi.string()),
      tutorId: Joi.string(),
      structureId: Joi.string(),
      startDate: Joi.string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .required(),
      endDate: Joi.string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .required(),
    })
      .oxor("department", "tutorId", "structureId")
      .validate(req.body);

    if (error) {
      console.log(error);
      return res.status(400).send({ ok: false, code: "INVALID_PARAMS" });
    }

    let result;
    if (value.department?.length) {
      result = await db.query(
        `
        select evenement_valeur from "public"."log_missions"
        where evenement_nom = 'STATUS_MISSION_CHANGE' and evenement_valeur in (:status)
        and mission_departement in (:department)
        and "date" between :startDate and :endDate::date + 1;`,
        {
          type: db.QueryTypes.SELECT,
          replacements: { status: value.status, startDate: value.startDate, endDate: value.endDate, department: value.department },
        }
      );
    } else if (value.tutorId) {
      result = await db.query(
        `
        select evenement_valeur from "public"."log_missions"
        where evenement_nom = 'STATUS_MISSION_CHANGE' and evenement_valeur in (:status)
        and mission_tutorId = :tutorId
        and "date" between :startDate and :endDate::date + 1;`,
        {
          type: db.QueryTypes.SELECT,
          replacements: { tutorId: value.tutorId, status: value.status, startDate: value.startDate, endDate: value.endDate },
        }
      );
    } else if (value.structureId) {
      result = await db.query(
        `
        select evenement_valeur from "public"."log_missions"
        where evenement_nom = 'STATUS_MISSION_CHANGE' and evenement_valeur in (:status)
        and mission_structureId = structureId
        and "date" between :startDate and :endDate::date + 1;`,
        {
          type: db.QueryTypes.SELECT,
          replacements: { structureId: value.structureId, status: value.status, startDate: value.startDate, endDate: value.endDate },
        }
      );
    } else {
      result = await db.query(
        `
        select evenement_valeur from "public"."log_missions"
        where evenement_nom = 'STATUS_MISSION_CHANGE' and evenement_valeur in (:status)
        and "date" between :startDate and :endDate::date + 1;`,
        {
          type: db.QueryTypes.SELECT,
          replacements: { status: value.status, startDate: value.startDate, endDate: value.endDate },
        }
      );
    }

    return res.status(200).send({ ok: true, data: result });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: "Error in mission-change-status" });
  }
});

router.post("/application-accepted_refused/count", async (req, res) => {
  try {
    const { error, value } = Joi.object({
      status: Joi.array().items(Joi.string().valid("WAITING_VALIDATION", "WAITING_ACCEPTATION", "VALIDATED", "REFUSED", "CANCEL", "IN_PROGRESS", "DONE", "ABANDON", "WAITING_VERIFICATION").required()),
      department: Joi.array().items(Joi.string()),
      startDate: Joi.string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .required(),
      endDate: Joi.string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .required(),
    }).validate(req.body);

    if (error) {
      console.log(error);
      return res.status(400).send({ ok: false, code: "INVALID_PARAMS" });
    }

    let result = await db.query(
      `
      select value from "public"."logs_by_day_application_status_change_event" l
      where value in (:status)
      and "date" BETWEEN :startDate and :endDate::date + 1
      and exists (
      select 1 from "public"."logs_by_day_application_status_change_event" l2
      where value = 'WAITING_VALIDATION'
      and candidature_mission_department in (:department)
      and l2.candidature_id = l.candidature_id
      );`,
      {
        type: db.QueryTypes.SELECT,
        replacements: { department: value.department, status: value.status, startDate: value.startDate, endDate: value.endDate },
      }
    );

    return res.status(200).send({ ok: true, data: result });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: "Error in application-accepted_refused" });
  }
});

router.post("/application-change-status/count", async (req, res) => {
  try {
    const { error, value } = Joi.object({
      status: Joi.array().items(Joi.string().valid("WAITING_VALIDATION", "WAITING_ACCEPTATION", "VALIDATED", "REFUSED", "CANCEL", "IN_PROGRESS", "DONE", "ABANDON", "WAITING_VERIFICATION").required()),
      structureId: Joi.string(),
      department: Joi.array().items(Joi.string()),
      startDate: Joi.string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .required(),
      endDate: Joi.string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .required(),
    })
      .oxor("department", "structureId")
      .validate(req.body);

    if (error) {
      console.log(error);
      return res.status(400).send({ ok: false, code: "INVALID_PARAMS" });
    }

    let result;
    if (value.structureId) {
      result = await db.query(
        `
        select value from "public"."logs_by_day_application_status_change_event"
        where candidature_structure_id = :structureId
        and value in (:status)
        and "date" between :startDate and :endDate::date + 1;`,
        {
          type: db.QueryTypes.SELECT,
          replacements: { structureId: value.structureId, status: value.status, startDate: value.startDate, endDate: value.endDate },
        }
      );
    } else if (value.department?.length) {
      result = await db.query(
        `
        select value from "public"."logs_by_day_application_status_change_event"
        where candidature_mission_department in (:department)
        and value in (:status)
        and "date" between :startDate and :endDate::date + 1;`,
        {
          type: db.QueryTypes.SELECT,
          replacements: { department: value.department, status: value.status, startDate: value.startDate, endDate: value.endDate },
        }
      );
    } else {
      result = await db.query(
        `
        select value from "public"."logs_by_day_application_status_change_event"
        where value in (:status)
        and "date" between :startDate and :endDate::date + 1;`,
        {
          type: db.QueryTypes.SELECT,
          replacements: { status: value.status, startDate: value.startDate, endDate: value.endDate },
        }
      );
    }

    return res.status(200).send({ ok: true, data: result });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: "Error in application-change-status" });
  }
});

router.post("/application-contract-signed/count", async (req, res) => {
  try {
    const { error, value } = Joi.object({
      status: Joi.string().valid("WAITING_VALIDATION", "WAITING_ACCEPTATION", "VALIDATED", "REFUSED", "CANCEL", "IN_PROGRESS", "DONE", "ABANDON", "WAITING_VERIFICATION").required(),
      department: Joi.array().items(Joi.string()),
      startDate: Joi.string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .required(),
      endDate: Joi.string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .required(),
    }).validate(req.body);

    if (error) {
      console.log(error);
      return res.status(400).send({ ok: false, code: "INVALID_PARAMS" });
    }

    let result;
    if (value.department?.length) {
      result = await db.query(
        `
        select candidature_id from "public"."logs_by_day_application_status_change_event"
        where candidature_mission_department in (:department)
        and value = :status
        and "date" between :startDate and :endDate::date + 1;`,
        {
          type: db.QueryTypes.SELECT,
          replacements: { department: value.department, status: value.status, startDate: value.startDate, endDate: value.endDate },
        }
      );
    } else {
      result = await db.query(
        `
        select candidature_id from "public"."logs_by_day_application_status_change_event"
        where value = :status
        and "date" between :startDate and :endDate::date + 1;`,
        {
          type: db.QueryTypes.SELECT,
          replacements: { status: value.status, startDate: value.startDate, endDate: value.endDate },
        }
      );
    }

    return res.status(200).send({ ok: true, data: result });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: "Error in application-contract-signed" });
  }
});

module.exports = router;
