const mongoose = require("mongoose");
const { MONGO_URL, ENVIRONMENT } = require("../../config.js");

//Set up default mongoose connection

if (MONGO_URL) {
  if (ENVIRONMENT == "production") {
    mongoose.connect(MONGO_URL, {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false, // * https://stackoverflow.com/a/52572958
      poolSize: 5_000,
      maxPoolSize: 5_000,
      minPoolSize: 500,
      waitQueueTimeoutMS: 30_000,
    });
  } else {
    mongoose.connect(MONGO_URL, {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false, // * https://stackoverflow.com/a/52572958
      poolSize: 500,
      maxPoolSize: 500,
      minPoolSize: 200,
      waitQueueTimeoutMS: 30_000,
    });
  }
} else {
  console.log("ERROR CONNEXION. MONGO URL EMPTY");
}

mongoose.Promise = global.Promise; //Get the default connection
let db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on("error", console.error.bind(console, "MongoDB connection error:"));
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

module.exports = db;
