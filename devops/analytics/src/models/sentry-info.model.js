const { DataTypes } = require("sequelize");
const { db } = require("../services/databases/postgresql.service");

const sentryInfo = db.define(
  "sentryInfo",
  {
    nb_errors_total: DataTypes.INTEGER,
    nb_errors_accepted: DataTypes.INTEGER,
    nb_errors_rejected: DataTypes.INTEGER,
    nb_errors_blacklisted: DataTypes.INTEGER,
    date: DataTypes.TEXT,
  },
  {
    defaultScope: {
      attributes: { exclude: ["createdAt", "updatedAt"] },
    },
  },
);

module.exports = sentryInfo;
