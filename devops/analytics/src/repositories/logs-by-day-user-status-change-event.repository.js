const { Op } = require("sequelize");
const { db } = require("../services/databases/postgresql.service");
const REDIS_KEYS = require("../services/databases/redis.constants");
const model = require("../models/logs-by-day-user-status-change-event.model");

const repository = {};

repository.countByStatus = (status, startDate, endDate) =>
  db.cacheRequest({ key: REDIS_KEYS.LOGS_DAY_USER_STATUS_COUNT_STATUS }, model, "count", {
    where: {
      value: status,
      date: {
        [Op.between]: [startDate, endDate],
      },
    },
    distinct: true,
    col: "young_id",
  });

repository.countByStatusAndRegion = (status, region, startDate, endDate) =>
  db.cacheRequest({ key: REDIS_KEYS.LOGS_DAY_USER_STATUS_COUNT_STATUS_REGION }, model, "count", {
    where: {
      value: status,
      region,
      date: {
        [Op.between]: [startDate, endDate],
      },
    },
    distinct: true,
    col: "young_id",
  });

repository.countByStatusAndDepartment = (status, department, startDate, endDate) =>
  db.cacheRequest({ key: REDIS_KEYS.LOGS_DAY_USER_STATUS_COUNT_STATUS_DEPARTMENT }, model, "count", {
    where: {
      value: status,
      department,
      date: {
        [Op.between]: [startDate, endDate],
      },
    },
    distinct: true,
    col: "young_id",
  });

module.exports = repository;
