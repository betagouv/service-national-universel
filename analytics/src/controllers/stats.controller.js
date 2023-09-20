const Joi = require("joi");
const express = require("express");
const router = express.Router();

const { capture } = require("../sentry");
const { db } = require("../services/databases/postgresql.service");
const REDIS_KEYS = require("../services/databases/redis.constants");
const logsByDayUserStatusChangeEventRepository = require("../repositories/logs-by-day-user-status-change-event.repository");
const logsByDayUserCohortChangeEventRepository = require("../repositories/logs-by-day-user-cohort-change-event.repository");
const logsByDayApplicationStatusChangeEventRepository = require("../repositories/logs-by-day-application-status-change-event.repository");
const logMissionsRepository = require("../repositories/log-missions.repository");
const authMiddleware = require("../middlewares/auth.middleware");
const validationMiddleware = require("../middlewares/validation.middleware");

// Les vues matérialisées doivent être rafraîchies manuellement.
// Un cron tourne tous les jours à 5h du matin pour rafraîchir les vues matérialisées (environ 2 minutes par vue)
router.post("/refresh", authMiddleware, async (req, res) => {
  try {
    await db.query(`refresh materialized view logs_by_day_user_cohort_change_event;`);
    await db.query(`refresh materialized view logs_by_day_user_status_change_event;`);
    await db.query(`refresh materialized view logs_by_day_application_status_change_event;`);

    // Clear postgresql cache from redis after refresh
    db.cacheClear();

    return res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: "Error in refresh" });
  }
});

// Compter les jeunes qui ont changé de statut dans une période
// Pour 1..n départements ou 1..n régions ou au global
router.post(
  "/young-status/count",
  authMiddleware,
  validationMiddleware(
    Joi.object({
      region: Joi.string(),
      department: Joi.array().items(Joi.string()),
      status: Joi.string().valid("VALIDATED", "WAITING_VALIDATION", "WITHDRAWN").required(),
      startDate: Joi.string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .required(),
      endDate: Joi.string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .required(),
    }).oxor("region", "department"),
  ),
  async ({ body }, res) => {
    try {
      let result;
      if (body.region?.length) {
        result = await logsByDayUserStatusChangeEventRepository.countByStatusAndRegion(body.status, body.region, body.startDate, body.endDate);
      } else if (body.department?.length) {
        result = await logsByDayUserStatusChangeEventRepository.countByStatusAndDepartment(body.status, body.department, body.startDate, body.endDate);
      } else {
        result = await logsByDayUserStatusChangeEventRepository.countByStatus(body.status, body.startDate, body.endDate);
      }
      return res.status(200).send({ ok: true, data: result });
    } catch (error) {
      capture(error);
      res.status(500).send({ ok: false, code: "Error in young-status" });
    }
  },
);

// Compter les jeunes qui ont changé de cohorte dans une période
// Pour 1..n départements ou 1..n régions ou au global
router.post(
  "/young-cohort/count",
  authMiddleware,
  validationMiddleware(
    Joi.object({
      region: Joi.string(),
      department: Joi.array().items(Joi.string()),
      startDate: Joi.string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .required(),
      endDate: Joi.string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .required(),
    }).oxor("region", "department"),
  ),
  async ({ body }, res) => {
    try {
      let result;
      if (body.region?.length) {
        result = await logsByDayUserCohortChangeEventRepository.countByRegion(body.region, body.startDate, body.endDate);
      } else if (body.department?.length) {
        result = await logsByDayUserCohortChangeEventRepository.countByDepartment(body.department, body.startDate, body.endDate);
      } else {
        result = await logsByDayUserCohortChangeEventRepository.count(body.startDate, body.endDate);
      }
      return res.status(200).send({ ok: true, data: result });
    } catch (error) {
      capture(error);
      res.status(500).send({ ok: false, code: "Error in young-cohort" });
    }
  },
);

router.post(
  "/application-contract-signed",
  authMiddleware,
  validationMiddleware({
    status: Joi.string().valid("WAITING_VALIDATION", "WAITING_ACCEPTATION", "VALIDATED", "REFUSED", "CANCEL", "IN_PROGRESS", "DONE", "ABANDON", "WAITING_VERIFICATION").required(),
    department: Joi.array().items(Joi.string()),
    startDate: Joi.string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .required(),
    endDate: Joi.string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .required(),
  }),
  async ({ body }, res) => {
    try {
      let result;
      if (body.department?.length) {
        result = await logsByDayApplicationStatusChangeEventRepository.findByStatusAndDepartment(body.status, body.department, body.startDate, body.endDate);
      } else {
        result = await logsByDayApplicationStatusChangeEventRepository.findByStatus(body.status, body.startDate, body.endDate);
      }

      return res.status(200).send({ ok: true, data: result });
    } catch (error) {
      capture(error);
      res.status(500).send({ ok: false, code: "Error in application-contract-signed" });
    }
  },
);

router.post(
  "/mission-change-status",
  authMiddleware,
  validationMiddleware(
    Joi.object({
      status: Joi.array().items(Joi.string().valid("DRAFT", "WAITING_VALIDATION", "WAITING_CORRECTION", "VALIDATED", "REFUSED", "CANCEL", "ARCHIVED").required()),
      department: Joi.array().items(Joi.string()),
      structureId: Joi.string(),
      startDate: Joi.string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .required(),
      endDate: Joi.string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .required(),
    }).oxor("department", "structureId"),
  ),
  async ({ body }, res) => {
    try {
      let result;
      if (body.department?.length) {
        result = await logMissionsRepository.findByNameAndStatusAndDepartment("STATUS_MISSION_CHANGE", body.status, body.department, body.startDate, body.endDate);
      } else if (body.structureId) {
        result = await logMissionsRepository.findByNameAndStatusAndStructureId("STATUS_MISSION_CHANGE", body.status, body.structureId, body.startDate, body.endDate);
      } else {
        result = await logMissionsRepository.findByNameAndStatus("STATUS_MISSION_CHANGE", body.status, body.startDate, body.endDate);
      }

      return res.status(200).send({ ok: true, data: result });
    } catch (error) {
      capture(error);
      res.status(500).send({ ok: false, code: "Error in mission-change-status" });
    }
  },
);

router.post(
  "/young-validated-from",
  authMiddleware,
  validationMiddleware(
    Joi.object({
      fromStatus: Joi.array().items(Joi.string().valid("IN_PROGRESS", "WAITING_VALIDATION", "WAITING_CORRECTION", "REINSCRIPTION", "VALIDATED", "REFUSED", "WITHDRAWN", "DELETED", "WAITING_LIST", "NOT_ELIGIBLE", "ABANDONED", "NOT_AUTORISED").required()),
      toStatus: Joi.string().valid("IN_PROGRESS", "WAITING_VALIDATION", "WAITING_CORRECTION", "REINSCRIPTION", "VALIDATED", "REFUSED", "WITHDRAWN", "DELETED", "WAITING_LIST", "NOT_ELIGIBLE", "ABANDONED", "NOT_AUTORISED").required(),
      department: Joi.array().items(Joi.string()),
      region: Joi.string(),
      startDate: Joi.string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .required(),
      endDate: Joi.string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .required(),
    }).oxor("department", "region"),
  ),
  async ({ body }, res) => {
    try {
      let result;
      if (body.department?.length) {
        result = await db.cacheRequest(
          { key: REDIS_KEYS.LOGS_DAY_USER_STATUS_QUERY_FROM_TO_DEPARTMENT },
          db,
          "query",
          `
            select value from "public"."logs_by_day_user_status_change_event" l
            where value = :toStatus
            and "date" between :startDate and :endDate::date + 1
            and exists (
            select 1 from "public"."logs_by_day_user_status_change_event" l2
              where value in (:fromStatus)
              and department in (:department)
              and l2.young_id = l.young_id
            );
          `,
          {
            type: db.QueryTypes.SELECT,
            replacements: { toStatus: body.toStatus, fromStatus: body.fromStatus, startDate: body.startDate, endDate: body.endDate, department: body.department },
          },
        );
      } else if (body.region) {
        result = await db.cacheRequest(
          { key: REDIS_KEYS.LOGS_DAY_USER_STATUS_QUERY_FROM_TO_REGION },
          db,
          "query",
          `
            select value from "public"."logs_by_day_user_status_change_event" l
            where value = :toStatus
            and "date" between :startDate and :endDate::date + 1
            and exists (
              select 1 from "public"."logs_by_day_user_status_change_event" l2
              where value in (:fromStatus)
              and region = :region
              and l2.young_id = l.young_id
            );
          `,
          {
            type: db.QueryTypes.SELECT,
            replacements: { toStatus: body.toStatus, fromStatus: body.fromStatus, startDate: body.startDate, endDate: body.endDate, region: body.region },
          },
        );
      } else {
        result = await db.cacheRequest(
          { key: REDIS_KEYS.LOGS_DAY_USER_STATUS_QUERY_FROM_TO },
          db,
          "query",
          `
            select l2.value from "public"."logs_by_day_user_status_change_event" l2
            where l2.value in (:fromStatus)
            and exists (
              select 1 from "public"."logs_by_day_user_status_change_event" l
              where l.value = :toStatus
              and l."date" between :startDate and :endDate::date + 1
              and l2.young_id = l.young_id
            );
          `,
          {
            type: db.QueryTypes.SELECT,
            replacements: { toStatus: body.toStatus, fromStatus: body.fromStatus, startDate: body.startDate, endDate: body.endDate },
          },
        );
      }

      return res.status(200).send({ ok: true, data: result });
    } catch (error) {
      capture(error);
      res.status(500).send({ ok: false, code: "Error in young-validated-from" });
    }
  },
);

router.post(
  "/young-moved",
  authMiddleware,
  validationMiddleware({
    type: Joi.string().valid("DEPARTURE", "ARRIVAL").required(),
    department: Joi.string().required(),
    startDate: Joi.string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .required(),
    endDate: Joi.string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .required(),
  }),
  async ({ body }, res) => {
    try {
      let result;
      if (body.type === "DEPARTURE") {
        result = await db.cacheRequest(
          { key: REDIS_KEYS.LOGS_DAY_USER_STATUS_QUERY_MOVED_DEPARTURE },
          db,
          "query",
          `
            select py.user_id from "public"."log_youngs" py
            where py.evenement_nom in (:status)
            and py.user_departement = :department
            and exists (
              select 1 from "public"."log_youngs" y
              where y.user_id = py.user_id
              and y.evenement_nom in (:status)
              and y.user_departement != py.user_departement
              and y."date" between :startDate and :endDate::date + 1
            );
          `,
          {
            type: db.QueryTypes.SELECT,
            replacements: {
              status: "JEUNE_CHANGE",
              department: body.department,
              startDate: body.startDate,
              endDate: body.endDate,
            },
          },
        );
      } else {
        // ARRIVAL
        result = await db.cacheRequest(
          { key: REDIS_KEYS.LOGS_DAY_USER_STATUS_QUERY_MOVED_ARRIVAL },
          db,
          "query",
          `
            select y.user_id from "public"."log_youngs" y
            where y.evenement_nom in (:status)
            and y.user_departement = :department
            and y."date" between :startDate and :endDate::date + 1
            and exists (
              select 1 from "public"."log_youngs" py
              where py.user_id = y.user_id
              and py.evenement_nom in (:status)
              and py.user_departement != y.user_departement
              and py."date" < y."date"
            );
          `,
          {
            type: db.QueryTypes.SELECT,
            replacements: {
              status: "JEUNE_CHANGE",
              department: body.department,
              startDate: body.startDate,
              endDate: body.endDate,
            },
          },
        );
      }

      return res.status(200).send({ ok: true, data: result });
    } catch (error) {
      capture(error);
      res.status(500).send({ ok: false, code: "Error in young-moved" });
    }
  },
);

router.post(
  "/application-change-status",
  authMiddleware,
  validationMiddleware(
    Joi.object({
      status: Joi.array().items(Joi.string().valid("WAITING_VALIDATION", "WAITING_ACCEPTATION", "VALIDATED", "REFUSED", "CANCEL", "IN_PROGRESS", "DONE", "ABANDON", "WAITING_VERIFICATION").required()),
      structureId: Joi.string(),
      department: Joi.array().items(Joi.string()),
      startDate: Joi.string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .required(),
      endDate: Joi.string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .required(),
    }).oxor("department", "structureId"),
  ),
  async ({ body }, res) => {
    try {
      let result;
      if (body.structureId) {
        result = await logsByDayApplicationStatusChangeEventRepository.findByStatusAndStructureId(body.status, body.structureId, body.startDate, body.endDate);
      } else if (body.department?.length) {
        result = await logsByDayApplicationStatusChangeEventRepository.findByStatusAndDepartment(body.status, body.department, body.startDate, body.endDate);
      } else {
        result = await logsByDayApplicationStatusChangeEventRepository.findByStatus(body.status, body.startDate, body.endDate);
      }

      return res.status(200).send({ ok: true, data: result });
    } catch (error) {
      capture(error);
      res.status(500).send({ ok: false, code: "Error in application-change-status" });
    }
  },
);

router.post(
  "/application-accepted-refused",
  authMiddleware,
  validationMiddleware({
    status: Joi.array().items(Joi.string().valid("VALIDATED", "REFUSED").required()),
    department: Joi.array().items(Joi.string()),
    startDate: Joi.string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .required(),
    endDate: Joi.string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .required(),
  }),
  async ({ body }, res) => {
    try {
      const result = await db.cacheRequest(
        { key: REDIS_KEYS.LOGS_DAY_APP_STATUS_CHANGE_ACCEPTED_REFUSED },
        db,
        "query",
        `
          select value from "public"."logs_by_day_application_status_change_event" l
          where value in (:status)
          and "date" BETWEEN :startDate and :endDate::date + 1
          and exists (
            select 1 from "public"."logs_by_day_application_status_change_event" l2
            where value = 'WAITING_VALIDATION'
            and candidature_mission_department in (:department)
            and l2.candidature_id = l.candidature_id
          );
        `,
        {
          type: db.QueryTypes.SELECT,
          replacements: { department: body.department, status: body.status, startDate: body.startDate, endDate: body.endDate },
        },
      );

      return res.status(200).send({ ok: true, data: result });
    } catch (error) {
      capture(error);
      res.status(500).send({ ok: false, code: "Error in application-accepted-refused" });
    }
  },
);

module.exports = router;
