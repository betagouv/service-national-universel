require("dotenv").config({ path: "../.env-staging" });

require("../src/mongo");
const YoungModel = require("../src/models/young");
const SchoolModel = require("../src/models/school");

(async function run() {
  const cursor = YoungModel.find({}).cursor();
  await cursor.eachAsync(async function (doc) {
    try {
      // We update only users that seems to have a valid school.
      if (!doc.schoolName || !doc.schoolCity || !doc.schoolZip) return;
      const school = await SchoolModel.findOne({
        name2: doc.schoolName,
        postcode: doc.schoolZip,
        city: doc.schoolCity,
      });
      if (school && school._id) {
        console.log(`update ${doc.email} with school ${school._id}`);
        await doc.set({ schoolId: school._id });
        // await doc.save();
        // await doc.index();
      }
    } catch (e) {
      console.log("e", e);
    }
  });
  console.log("DONE.");
  process.exit(1);
})();
