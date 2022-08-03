const { DataTypes } = require("sequelize");
const { db } = require("../postgresql");

const OBJ = db.define(
  "log_youngs",
  {
    evenement_nom: DataTypes.TEXT,
    evenement_valeur: DataTypes.TEXT,
    evenement_type: DataTypes.TEXT,
    user_id: DataTypes.TEXT,
    user_genre: DataTypes.TEXT,
    user_date_de_naissance: DataTypes.TEXT,
    user_classe: DataTypes.TEXT,
    user_ecole_situation: DataTypes.TEXT,
    user_handicap_situation: DataTypes.TEXT,
    user_QPV: DataTypes.TEXT,
    user_departement: DataTypes.TEXT,
    user_region: DataTypes.TEXT,
    user_cohorte: DataTypes.TEXT,
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
