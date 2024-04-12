const mongoose = require("mongoose");
const { MONGO_URL, ENVIRONMENT } = require("./config.js");

// Set up default mongoose connection
async function initDB() {
  if (!MONGO_URL) {
    throw new Error("ERROR CONNECTION. MONGO URL EMPTY");
  }

  let options = {
    appname: "ApiSnu", // Add your application name
    // * Remove when we update to mongoose 6 : https://stackoverflow.com/a/68962378
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    // * ----
    maxPoolSize: 500,
    minPoolSize: 200,
    waitQueueTimeoutMS: 30_000,
    tls: true, // Enable TLS
  };

  if (ENVIRONMENT === "production") {
    options.maxPoolSize = 5_000;
    options.minPoolSize = 500;
  }

  try {
    await mongoose.connect(MONGO_URL, options);
  } catch (error) {
    if (error.reason && error.reason.servers) {
      console.error(error.reason.servers);
    } else {
      console.error("MongoDB connection error:", error);
    }
    throw error;
  }

  const db = mongoose.connection;

  db.on("error", console.error.bind(console, "MongoDB connection error:"));
  db.on("disconnected", () => console.log("MongoDB disconnected"));
  db.on("close", () => console.log("MongoDB close"));
  db.once("open", () => console.log("MongoDB connection OK"));
}

async function closeDB() {
  const db = mongoose.connection;
  await db.close();
}

module.exports = {
  initDB,
  closeDB,
};
