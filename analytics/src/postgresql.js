require("dotenv").config({ path: "../.env" });
const { Sequelize } = require("sequelize");
const { POSTGRESQL } = require("./config");

const db = new Sequelize(POSTGRESQL, {
  logging: false,
});

db.authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
    // db.drop();
  })
  .catch((err) => console.error("Unable to connect to the database:", err));

module.exports = { db };
