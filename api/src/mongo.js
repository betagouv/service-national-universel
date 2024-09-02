const config = require("config");
const { logger } = require("./logger");
const mongoose = require("mongoose");
const { capture } = require("./sentry");

// Set up default mongoose connection
async function initDB() {
  if (!config.MONGO_URL) {
    throw new Error("ERROR CONNECTION. MONGO URL EMPTY");
  }
  const db = mongoose.connection;

  db.on("error", (error) => capture(error));

  db.on("connecting", () => logger.debug("MONGODB: connecting"));
  db.on("open", () => logger.debug("MONGODB: open"));
  db.on("connected", () => logger.debug("MONGODB: connected"));
  db.on("disconnecting", () => logger.debug("MONGODB: disconnecting"));
  db.on("disconnected", () => logger.debug("MONGODB: disconnected"));
  db.on("reconnected", () => logger.debug("MONGODB: reconnected"));
  db.on("close", () => logger.debug("MONGODB: close"));

  db.on("fullsetup", () => logger.debug("MONGODB: fullsetup"));
  db.on("all", () => logger.debug("MONGODB: all"));
  db.on("reconnectFailed", () => logger.debug("MONGODB: reconnectFailed"));

  let options = {
    appname: "ApiSnu", // Add your application name
    maxPoolSize: 30,
    minPoolSize: 5,
    waitQueueTimeoutMS: 30_000,
  };

  if (config.ENVIRONMENT === "production") {
    options.maxPoolSize = 200;
    options.minPoolSize = 50;
  }

  mongoose.set("strictQuery", false);
  await mongoose.connect(config.MONGO_URL, options);
}

async function closeDB() {
  return await mongoose.connection.close();
}

async function startSession() {
  return await mongoose.startSession();
}

async function withTransaction(session, callback) {
  return await session.withTransaction(callback);
}

async function endSession(session) {
  return await session.endSession();
}

function getDb() {
  return mongoose.connection;
}

module.exports = {
  initDB,
  closeDB,
  startSession,
  withTransaction,
  endSession,
  getDb,
};
