require("dotenv").config({ path: "../.env-prod" });

require("../src/mongo");
const YoungModel = require("../src/models/young");

const clean = async (model) => {
  const cursor = model.find({ cohort: "2020" }).cursor();
  let countTotal = 0;
  let count = 0;
  await cursor.eachAsync(async function (doc) {
    countTotal++;
    try {
      // if the inscriptionStep value is different from the default value, we skip to the next one
      if (doc.schoolDepartment && doc.department !== doc.schoolDepartment) {
        count++;
        console.log(doc.email);
        // doc.set({ department: doc.schoolDepartment });
      }

      // await doc.save();
      // await doc.index();
    } catch (e) {
      console.log("e", e);
    }
  });
  console.log(`${countTotal} youngs scanned. ${count} has been modified.`);
};

(async function run() {
  await clean(YoungModel);
  process.exit(1);
})();
