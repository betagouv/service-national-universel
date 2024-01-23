const { DataTypes } = require("sequelize");
const { db } = require("../services/databases/postgresql.service");

const OBJ = db.define(
  "log_classes",
  {
    evenement_nom: DataTypes.TEXT,
    evenement_valeur: DataTypes.TEXT,
    evenement_type: DataTypes.TEXT,
    classe_id: DataTypes.TEXT,
    classe_etablissement_id: DataTypes.TEXT,
    classe_name: DataTypes.TEXT,
    classe_type: DataTypes.TEXT,
    date: DataTypes.DATE,
    raw_data: DataTypes.JSONB,
  },
  {
    defaultScope: {
      attributes: { exclude: ["createdAt", "updatedAt", "raw_data"] },
    },
  },
);

module.exports = OBJ;
