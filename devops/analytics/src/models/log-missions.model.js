const { DataTypes } = require("sequelize");
const { db } = require("../services/databases/postgresql.service");

const OBJ = db.define(
  "log_missions",
  {
    evenement_nom: DataTypes.TEXT,
    evenement_valeur: DataTypes.TEXT,
    evenement_type: DataTypes.TEXT,
    mission_id: DataTypes.TEXT,
    mission_structureId: DataTypes.TEXT,
    mission_status: DataTypes.TEXT,
    mission_nom: DataTypes.TEXT,
    mission_departement: DataTypes.TEXT,
    mission_region: DataTypes.TEXT,
    mission_domaine: DataTypes.TEXT,
    mission_duree: DataTypes.TEXT,
    mission_placesTotal: DataTypes.INTEGER,
    mission_placesRestantes: DataTypes.INTEGER,
    mission_preparationMilitaire: DataTypes.TEXT,
    mission_JVA: DataTypes.TEXT,
    date: DataTypes.DATE,
    raw_data: DataTypes.JSONB,
  },
  {
    freezeTableName: true,
    defaultScope: {
      attributes: { exclude: ["createdAt", "updatedAt", "raw_data"] },
    },
  },
);

module.exports = OBJ;
