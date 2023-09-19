const { DataTypes } = require("sequelize");
const { db } = require("../postgresql");

const codeClimate = db.define(
  "codeClimate",
  {
    technical_debt_ratio: DataTypes.FLOAT,
    test_coverage: DataTypes.FLOAT,
  },
  {
    defaultScope: {
      attributes: { exclude: ["createdAt", "updatedAt"] },
    },
  },
);

module.exports = codeClimate;
