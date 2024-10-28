const { DataTypes } = require("sequelize");
const { db } = require("../services/databases/postgresql.service");

const OBJ = db.define(
  "logs_by_day_application_status_change_event",
  {
    candidature_id: DataTypes.TEXT,
    date: "TIMESTAMP WITH TIME ZONE",
    value: DataTypes.TEXT,
    candidature_structure_id: DataTypes.TEXT,
    candidature_mission_department: DataTypes.TEXT,
  },
  {
    freezeTableName: true,
  },
);

module.exports = OBJ;
