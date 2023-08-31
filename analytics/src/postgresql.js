require("dotenv").config({ path: "../.env" });
const { Sequelize } = require("sequelize");
const { POSTGRESQL } = require("./config");

const db = new Sequelize("postgresql://upz0fnlx4epnn85yblhe:MalFhLKIoK5QLxm8NkH1@bo2ecjgnczw1hu8uvnme-postgresql.services.clever-cloud.com:5606/bo2ecjgnczw1hu8uvnme", {
  logging: false,
});

db.authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
    // db.drop();
  })
  .catch((err) => console.error("Unable to connect to the database:", err));

module.exports = { db };
