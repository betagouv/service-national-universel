const { DataTypes, Sequelize } = require("sequelize");
const { db } = require("../postgresql");

const OBJ = db.define("log", {
  event: DataTypes.TEXT,
  status: DataTypes.NUMBER,
  query: DataTypes.JSONB,
});

OBJ.sync({ alter: true });
module.exports = OBJ;
