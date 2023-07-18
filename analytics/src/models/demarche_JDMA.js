const { DataTypes } = require("sequelize");
const { db } = require("../postgresql");

const Demarche = db.define(
  "demarche",
  {
    demarcheId: DataTypes.INTEGER,
    nom: DataTypes.TEXT,
    answersTotal: DataTypes.INTEGER,
    satisfaction_negative: DataTypes.INTEGER,
    satisfaction_neutral: DataTypes.INTEGER,
    satisfaction_positive: DataTypes.INTEGER,
    easy_negative: DataTypes.INTEGER,
    easy_neutral: DataTypes.INTEGER,
    easy_positive: DataTypes.INTEGER,
    comprehensible_negative: DataTypes.INTEGER,
    comprehensible_neutral: DataTypes.INTEGER,
    comprehensible_positive: DataTypes.INTEGER,
    demarcheDate: DataTypes.DATE,
  },
  {
    defaultScope: {
      attributes: { exclude: ["createdAt", "updatedAt"] },
    },
  }
);

module.exports = Demarche;
