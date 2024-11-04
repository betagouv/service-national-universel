const { DataTypes } = require("sequelize");
const { db } = require("../services/databases/postgresql.service");

const uptimeRobot = db.define(
  "uptime_robot",
  {
    uptime_ratio: DataTypes.STRING,
    monitor_id: DataTypes.STRING,
    monitor_name: DataTypes.STRING,
    date: DataTypes.STRING,
  },
  {
    defaultScope: {
      attributes: { exclude: ["createdAt", "updatedAt"] },
    },
  },
);

module.exports = uptimeRobot;
