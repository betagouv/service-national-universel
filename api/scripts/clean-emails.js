require("dotenv").config({ path: "../.env-prod" });

require("../src/mongo");
const ReferentModel = require("../src/models/referent");
const YoungModel = require("../src/models/young");

const clean = async (model) => {
  const cursor = model.find({}).cursor();
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
};

(async function run() {
  console.log("CLEANING REFERENT EMAILS");
  await clean(ReferentModel);
  console.log("CLEANING YOUNG EMAILS");
  await clean(YoungModel);
})();
