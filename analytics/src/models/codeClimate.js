const { DataTypes } = require("sequelize");
const { db } = require("../postgresql");

const codeClimate = db.define(
  "codeClimate",
  {
    technical_debt_ratio: DataTypes.STRING,
    test_coverage: DataTypes.STRING,
    date: DataTypes.DATE,
  },
  {
    defaultScope: {
      attributes: { exclude: ["createdAt", "updatedAt"] },
    },
  },
);

module.exports = codeClimate;
