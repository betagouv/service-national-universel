const { DataTypes } = require("sequelize");
const { db } = require("../postgresql");

const OBJ = db.define(
  "log_missionEquivalence",
  {
    evenement_nom: DataTypes.TEXT,
    evenement_valeur: DataTypes.TEXT,
    evenement_type: DataTypes.TEXT,
    candidature_id: DataTypes.TEXT,
    candidature_user_id: DataTypes.TEXT,
    candidature_structure_name: DataTypes.TEXT,
    candidature_structure_id: DataTypes.TEXT,
    candidature_status: DataTypes.TEXT,
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
