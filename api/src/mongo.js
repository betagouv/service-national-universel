const mongoose = require("mongoose");
const { MONGO_URL, ENVIRONMENT } = require("./config.js");

//Set up default mongoose connection
async function initDB() {
  if (!MONGO_URL) {
    throw new Error("ERROR CONNEXION. MONGO URL EMPTY");
  }

  let options = {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false, // * https://stackoverflow.com/a/52572958
    poolSize: 500,
    maxPoolSize: 500,
    minPoolSize: 200,
    waitQueueTimeoutMS: 30_000,
  };

  if (ENVIRONMENT == "production") {
    options = {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false, // * https://stackoverflow.com/a/52572958
      poolSize: 5_000,
      maxPoolSize: 5_000,
      minPoolSize: 500,
      waitQueueTimeoutMS: 30_000,
    };
  }

  try {
    await mongoose.connect(MONGO_URL, options);
  } catch (error) {
    console.error(error.reason.servers);
    throw error
  }

  let db = mongoose.connection;

  //Bind connection to error event (to get notification of connection errors)
  db.on("error", console.error.bind(console, "MongoDB connection error:"));
  db.on("disconnected", () => {console.log("MongoDB disconnected")});
  db.on("close", () => {console.log("MongoDB close")});
  db.once("open", () => {
    console.log("MongoDB connexion OK");
    // db.db.listCollections().toArray(function (err, names) {
    //   if (err) {
    //     console.log(err);
    //   } else {
    //     for (i = 0; i < names.length; i++) {
    //       console.log(names[i].name);
    // if ((names[i].name = "userprofiles")) {
    //     console.log("Userprofile Collection Exists in DB");
    //     mongooseconnection.connection.db.dropCollection(
    //         "userprofiles",
    //         function(err, result) {
    //             console.log("Collection droped");
    //         }
    //     );
    //     console.log("Userprofile Collection No Longer Available");
    // } else {
    //     console.log("Collection doesn't exist");
    // }
    //     }
    //   }
    // });
  });
}

async function closeDB() {
  let db = mongoose.connection;

  await db.close()
}

module.exports = {
  initDB,
  closeDB,
}
