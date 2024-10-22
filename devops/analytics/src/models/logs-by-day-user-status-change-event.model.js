const { DataTypes } = require("sequelize");
const { db } = require("../services/databases/postgresql.service");

const OBJ = db.define(
  "logs_by_day_user_status_change_event",
  {
    young_id: DataTypes.TEXT,
    date: "TIMESTAMP WITH TIME ZONE",
    value: DataTypes.TEXT,
    department: DataTypes.TEXT,
    cohort: DataTypes.TEXT,
    region: DataTypes.TEXT,
  },
  {
    freezeTableName: true,
  },
);

module.exports = OBJ;
