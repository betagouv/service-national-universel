const Sequelize = require("sequelize");
const { db } = require("../services/databases/postgresql.service");
const REDIS_KEYS = require("../services/databases/redis.constants");
const model = require("../models/log-missions.model");

const repository = {};

repository.findByNameAndStatus = (name, status, startDate, endDate) =>
  db.cacheRequest({ key: REDIS_KEYS.LOG_MISSIONS_FIND_BY_NAME_STATUS }, model, "findAll", {
    where: {
      evenement_nom: name,
      evenement_valeur: {
        [Sequelize.Op.in]: status,
      },
      date: {
        [Sequelize.Op.between]: [startDate, endDate],
      },
    },
    attributes: ["evenement_valeur"],
  });

repository.findByNameAndStatusAndDepartment = (name, status, department, startDate, endDate) =>
  db.cacheRequest({ key: REDIS_KEYS.LOG_MISSIONS_FIND_BY_NAME_STATUS_DEPARTMENT }, model, "findAll", {
    where: {
      evenement_nom: name,
      evenement_valeur: {
        [Sequelize.Op.in]: status,
      },
      mission_departement: {
        [Sequelize.Op.in]: department,
      },
      date: {
        [Sequelize.Op.between]: [startDate, endDate],
      },
    },
    attributes: ["evenement_valeur"],
  });

repository.findByNameAndStatusAndStructureId = (name, status, structureId, startDate, endDate) =>
  db.cacheRequest({ key: REDIS_KEYS.LOG_MISSIONS_FIND_BY_NAME_STATUS_STRUCTURE_ID }, model, "findAll", {
    where: {
      evenement_nom: name,
      evenement_valeur: {
        [Sequelize.Op.in]: status,
      },
      mission_structureId: structureId,
      date: {
        [Sequelize.Op.between]: [startDate, endDate],
      },
    },
    attributes: ["evenement_valeur"],
  });

module.exports = repository;
