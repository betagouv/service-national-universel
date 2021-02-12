require("dotenv").config({ path: "../.env-staging" });

require("../src/mongo");
const ReferentModel = require("../src/models/referent");
const YoungModel = require("../src/models/young");

const sync = async (model) => {
  const cursor = model.find({}).cursor();
  let count = 0;
  await cursor.eachAsync(async function (doc) {
    try {
      if (doc.role === "structure_responsible") doc.set({ role: "supervisor" });
      else if (doc.role === "structure_member" || doc.role === "tutor") doc.set({ role: "responsible" });
      await doc.save();
      await doc.index();
    } catch (e) {
      console.log("e", e);
    }
    count++;
    if (count % 100 === 0) console.log(count);
  });
};

(async function run() {
  await sync(ReferentModel);
})();
