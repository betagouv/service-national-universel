const mongoose = require("mongoose");
const config = require("config");

// Set up default mongoose connection
async function initDB() {
  if (!config.MONGO_URL) {
    throw new Error("ERROR CONNECTION. MONGO URL EMPTY");
  }
  const db = mongoose.connection;

  db.on("error", console.error.bind(console, "MONGODB: connection error:"));

  db.on("connecting", () => console.log("MONGODB: connecting"));
  db.on("open", () => console.log("MONGODB: open"));
  db.on("connected", () => console.log("MONGODB: connected"));
  db.on("disconnecting", () => console.log("MONGODB: disconnecting"));
  db.on("disconnected", () => console.log("MONGODB: disconnected"));
  db.on("reconnected", () => console.log("MONGODB: reconnected"));
  db.on("close", () => console.log("MONGODB: close"));

  db.on("fullsetup", () => console.log("MONGODB: fullsetup"));
  db.on("all", () => console.log("MONGODB: all"));
  db.on("reconnectFailed", () => console.log("MONGODB: reconnectFailed"));

  let options = {
    appname: "ApiSnu", // Add your application name
    // * Remove when we update to mongoose 6 : https://stackoverflow.com/a/68962378
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    // * ----
    maxPoolSize: 30,
    minPoolSize: 5,
    waitQueueTimeoutMS: 30_000,
  };

  if (config.ENVIRONMENT === "production") {
    options.maxPoolSize = 200;
    options.minPoolSize = 50;
  }

  try {
    await mongoose.connect(config.MONGO_URL, options);
  } catch (error) {
    if (error.reason && error.reason.servers) {
      console.error(error.reason.servers);
    } else {
      console.error("MONGODB: connection error:", error);
    }
    throw error;
  }
}

async function closeDB() {
  const db = mongoose.connection;
  await db.close();
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
