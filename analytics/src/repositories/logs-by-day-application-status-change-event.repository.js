const Sequelize = require("sequelize");
const { db } = require("../services/databases/postgresql.service");
const REDIS_KEYS = require("../services/databases/redis.constants");
const model = require("../models/logs-by-day-application-status-change-event.model");

const repository = {};

repository.findByStatus = (status, startDate, endDate) =>
  db.cacheRequest({ key: REDIS_KEYS.LOGS_DAY_APP_STATUS_CHANGE_FIND_BY_STATUS }, model, "findAll", {
    where: {
      value: status,
      date: {
        [Sequelize.Op.between]: [startDate, endDate],
      },
    },
    attributes: ["value", "candidature_id"],
  });

repository.findByStatusAndDepartment = (status, department, startDate, endDate) =>
  db.cacheRequest({ key: REDIS_KEYS.LOGS_DAY_APP_STATUS_CHANGE_FIND_BY_STATUS_DEPARTMENT }, model, "findAll", {
    where: {
      value: status,
      candidature_mission_department: {
        [Sequelize.Op.in]: department,
      },
      date: {
        [Sequelize.Op.between]: [startDate, endDate],
      },
    },
    attributes: ["value", "candidature_id"],
  });

repository.findByStatusAndStructureId = (status, structureId, startDate, endDate) =>
  db.cacheRequest({ key: REDIS_KEYS.LOGS_DAY_APP_STATUS_CHANGE_FIND_BY_STATUS_STRUCTURE_ID }, model, "findAll", {
    where: {
      value: status,
      candidature_structure_id: structureId,
      date: {
        [Sequelize.Op.between]: [startDate, endDate],
      },
    },
    attributes: ["value", "candidature_id"],
  });

module.exports = repository;
