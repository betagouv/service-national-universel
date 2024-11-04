const { DataTypes } = require("sequelize");
const { db } = require("../services/databases/postgresql.service");

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
    user_rural: DataTypes.TEXT,
    user_source: DataTypes.TEXT,
    user_classe_id: DataTypes.TEXT,
    user_etablissement_id: DataTypes.TEXT,
    user_age: DataTypes.INTEGER,
    date: DataTypes.DATE,
    raw_data: DataTypes.JSONB,
    evenement_valeur_originelle: DataTypes.TEXT,
    modifier_user_id: DataTypes.TEXT,
    modifier_user_role: DataTypes.TEXT,
    modifier_user_first_name: DataTypes.TEXT,
  },
  {
    defaultScope: {
      attributes: { exclude: ["createdAt", "updatedAt", "raw_data"] },
    },
  },
);

module.exports = OBJ;
