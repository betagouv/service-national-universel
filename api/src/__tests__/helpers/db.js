require("dotenv").config({ path: "./.env-testing" });
const mongoose = require("mongoose");
const { MONGO_URL } = require("../../config");
jest.setTimeout(10_000);

let db = null;

const dbConnect = async () => {
  await mongoose.connect(MONGO_URL, {
    appname: "TestSnu",
    // * Remove when we update to mongoose 6 : https://stackoverflow.com/a/68962378
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false, // * https://stackoverflow.com/a/52572958
    // * ----
    maxPoolSize: 500,
    minPoolSize: 200,
    waitQueueTimeoutMS: 30_000,
  });

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
