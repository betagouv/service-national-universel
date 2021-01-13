require("dotenv").config({ path: "../.env-prod" });

require("../src/mongo");
const ReferentModel = require("../src/models/referent");

(async function run() {
  const cursor = ReferentModel.find({}).cursor();
  await cursor.eachAsync(async function (doc) {
    try {
      const firstName = doc.firstName.charAt(0).toUpperCase() + (doc.firstName || "").toLowerCase().slice(1);
      const lastName = doc.lastName.toUpperCase();
      const email = (doc.email || "").trim().toLowerCase();
      doc.set({ firstName, lastName, email });
      console.log(doc);
      // doc.save();
      // doc.index();
    } catch (e) {
      console.log("e", e);
    }
  });
})();
