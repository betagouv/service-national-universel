require("dotenv").config({ path: "../.env-staging" });

require("../src/mongo");
const ReferentModel = require("../src/models/referent");
const YoungModel = require("../src/models/young");

const clean = async (model) => {
  const cursor = model.find({}).cursor();
  await cursor.eachAsync(async function (doc) {
    try {
      const email = (doc.email || "").trim().toLowerCase();
      if (email !== doc.email) {
        console.log("old email: ", doc.email);
        const existingEmail = await model.findOne({ email });
        if (existingEmail) {
          console.log(`Email ${email} already exist, SKIPPED`);
        } else {
          doc.set({ email });
          console.log("new email: ", doc.email);
          await doc.save();
          await doc.index();
        }
      }
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
  process.exit(1);
})();
