require("dotenv").config({ path: "../.env-staging" });

require("../src/mongo");
const ReferentModel = require("../src/models/referent");
const YoungModel = require("../src/models/young");
const ApplicationModel = require("../src/models/application");

(async (model) => {
  const cursor = YoungModel.find().cursor();
  await cursor.eachAsync(async function (doc) {
    try {
      const applications = await ApplicationModel.find({ youngId: doc._id }).sort("name").cursor();
      await updatePriority(applications);
    } catch (e) {
      console.log("e", e);
    }
  });
  process.exit(1);
})();

const updatePriority = async (applications) => {
  let priority = 1;
  await applications.eachAsync(async function (doc) {
    try {
      doc.set({ priority });
      priority++;
      await doc.save();
      await doc.index();
    } catch (error) {
      console.log("error update", error);
    }
  });
};
