const { DataTypes } = require("sequelize");
const { db } = require("../services/databases/postgresql.service");

const OBJ = db.define(
  "log_etablissements",
  {
    evenement_valeur: DataTypes.TEXT,
    evenement_type: DataTypes.TEXT,
    etablissement_id: DataTypes.TEXT,
    etablissement_name: DataTypes.TEXT,
    etablissement_department: DataTypes.TEXT,
    etablissement_region: DataTypes.TEXT,
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
