require("dotenv").config({ path: "../.env-staging" });

require("../src/mongo");
const YoungModel = require("../src/models/young");

const clean = async (model) => {
  const cursor = model.find({ cohort: { $in: ["2019", "2020"] } }).cursor();
  let countTotal = 0;
  let count = 0;
  await cursor.eachAsync(async function (doc) {
    countTotal++;
    if (countTotal % 100 === 0) console.log(countTotal);
    try {
      // if the inscriptionStep value is different from the default value, we skip to the next one
      if (doc.statusPhase2 !== "VALIDATED") return;

      // if it is a new one, different from the default one, we set it and save it
      count++;
      console.log(`${doc.email} is at phase 3 `);
      doc.set({ phase: "CONTINUE", statusPhase3: "WAITING_REALISATION" });
      await doc.save();
      await doc.index();
    } catch (e) {
      console.log("e", e);
    }
  });
  console.log(`${countTotal} youngs scanned. ${count} has been modified.`);
};

(async function run() {
  console.log("START");
  await clean(YoungModel);
  process.exit(0);
})();
