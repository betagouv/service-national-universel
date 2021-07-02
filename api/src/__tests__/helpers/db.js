require("dotenv").config({ path: "./.env-testing" });
const mongoose = require("mongoose");
const { MONGO_URL } = require("../../config");
jest.setTimeout(10_000);

global.db = null;

const dbConnect = async () => {
  await mongoose.connect(MONGO_URL, { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true });
  mongoose.Promise = global.Promise; //Get the default connection
  db = mongoose.connection;
  db.on("error", console.error.bind(console, "MongoDB connection error:"));
  db.once("open", () => console.log("CONNECTED OK"));
};

const dbClose = async () => {
  db.close();
};

module.exports = {
  dbConnect,
  dbClose,
};
