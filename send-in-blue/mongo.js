const mongoose = require("mongoose");
const { MONGO_URL } = require("./config");

//Set up default mongoose connection

if (MONGO_URL) {
  mongoose.connect(MONGO_URL, {
    maxPoolSize: 500,
    minPoolSize: 50,
    waitQueueTimeoutMS: 30_000,
  });
} else {
  console.log("ERROR CONNEXION. MONGO URL EMPTY");
}

mongoose.Promise = global.Promise;
let db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => console.log("MongoDB connexion OK"));

module.exports = db;
