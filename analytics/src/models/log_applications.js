const { DataTypes } = require("sequelize");
const { db } = require("../postgresql");

const OBJ = db.define(
  "log_applications",
  {
    evenement_nom: DataTypes.TEXT,
    evenement_valeur: DataTypes.TEXT,
    evenement_type: DataTypes.TEXT,
    candidature_id: DataTypes.TEXT,
    user_id: DataTypes.TEXT,
    mission_id: DataTypes.TEXT,
    structure_id: DataTypes.TEXT,
    status: DataTypes.TEXT,
    date: DataTypes.DATE,
    raw_data: DataTypes.JSONB,
  },
  {
    defaultScope: {
      attributes: { exclude: ["createdAt", "updatedAt", "raw_data"] },
    },
  }
);

OBJ.sync({ alter: true });
module.exports = OBJ;
