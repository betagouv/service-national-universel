const Sequelize = require("sequelize");
const { db } = require("../services/databases/postgresql.service");
const REDIS_KEYS = require("../services/databases/redis.constants");
const model = require("../models/logs-by-day-user-cohort-change-event.model");

const repository = {};

repository.count = (startDate, endDate) =>
  db.cacheRequest({ key: REDIS_KEYS.LOGS_DAY_USER_COHORT_COUNT }, model, "count", {
    where: {
      date: {
        [Sequelize.Op.between]: [startDate, endDate],
      },
    },
    distinct: true,
    col: "young_id",
  });

repository.countByRegion = (region, startDate, endDate) =>
  db.cacheRequest({ key: REDIS_KEYS.LOGS_DAY_USER_COHORT_COUNT_REGION }, model, "count", {
    where: {
      region,
      date: {
        [Sequelize.Op.between]: [startDate, endDate],
      },
    },
    distinct: true,
    col: "young_id",
  });

repository.countByDepartment = (department, startDate, endDate) =>
  db.cacheRequest({ key: REDIS_KEYS.LOGS_DAY_USER_COHORT_COUNT_DEPARTMENT }, model, "count", {
    where: {
      department,
      date: {
        [Sequelize.Op.between]: [startDate, endDate],
      },
    },
    distinct: true,
    col: "young_id",
  });

module.exports = repository;
