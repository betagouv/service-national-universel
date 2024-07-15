const mongoose = require("mongoose");
const customMongo = require("../../mongo");
const MONGO_URL = "mongodb://localhost:27017/qwer";

let db = null;

const dbConnect = async () => {
  mongoose.set("strictQuery", false);
  await mongoose.connect(MONGO_URL, {
    appname: "TestSnu",
    // * ----
    maxPoolSize: 500,
    minPoolSize: 50,
    waitQueueTimeoutMS: 30_000,
    serverSelectionTimeoutMS: 1000,
  });

  mongoose.Promise = global.Promise; //Get the default connection
  db = mongoose.connection;
  db.on("error", console.error.bind(console, "MongoDB connection error:"));
  db.once("open", () => console.log("CONNECTED OK"));
};

const dbClose = async () => {
  return await mongoose.connection.close();
};

const mockTransaction = () => {
  jest.spyOn(customMongo, "startSession").mockResolvedValue(null);
  jest.spyOn(customMongo, "withTransaction").mockImplementation(async (_, callback) => callback());
  jest.spyOn(customMongo, "endSession").mockResolvedValue(true);
};

module.exports = {
  dbConnect,
  dbClose,
  mockTransaction,
};
