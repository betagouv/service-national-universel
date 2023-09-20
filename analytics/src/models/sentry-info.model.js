const { DataTypes } = require("sequelize");
const { db } = require("../services/databases/postgresql.service");

const sentryInfo = db.define(
  "sentryInfo",
  {
    nb_errors: DataTypes.INTEGER,
    date: DataTypes.TEXT,
  },
  {
    defaultScope: {
      attributes: { exclude: ["createdAt", "updatedAt"] },
    },
  },
);

module.exports = sentryInfo;
