const { DataTypes } = require("sequelize");
const { db } = require("../services/databases/postgresql.service");

const codeClimate = db.define(
  "codeClimate",
  {
    technical_debt_ratio: DataTypes.STRING,
    test_coverage: DataTypes.STRING,
    date: DataTypes.STRING,
  },
  {
    defaultScope: {
      attributes: { exclude: ["createdAt", "updatedAt"] },
    },
  },
);

module.exports = codeClimate;
