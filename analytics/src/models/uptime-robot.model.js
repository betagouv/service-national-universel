const { DataTypes } = require("sequelize");
const { db } = require("../services/databases/postgresql.service");

const uptimeRobot = db.define(
  "uptimeRobot",
  {
    uptime_ratio: DataTypes.STRING,
    monitor_id: DataTypes.STRING,
    date: DataTypes.STRING,
  },
  {
    defaultScope: {
      attributes: { exclude: ["createdAt", "updatedAt"] },
    },
  },
);

module.exports = uptimeRobot;
