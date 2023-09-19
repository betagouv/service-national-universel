const { DataTypes } = require("sequelize");
const { db } = require("../postgresql");

const uptimeRobot = db.define(
  "uptimeRobots",
  {
    uptime_ratio: DataTypes.INTEGER,
    monitor_id: DataTypes.TEXT,
  },
  {
    defaultScope: {
      attributes: { exclude: ["createdAt", "updatedAt"] },
    },
  },
);

module.exports = uptimeRobot;
