const { DataTypes } = require("sequelize");
const { db } = require("../postgresql");

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
