const { DataTypes } = require("sequelize");
const { db } = require("../postgresql");

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
