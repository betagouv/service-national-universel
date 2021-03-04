require("dotenv").config({ path: "../.env-staging" });

require("../src/mongo");
const ApplicationModel = require("../src/models/application");
const MissionModel = require("../src/models/mission");

(async function run() {
  const cursor = MissionModel.find({}).cursor();
  let count = 0;
  await cursor.eachAsync(async function (doc) {
    try {
      // Get all application for the mission
      const applications = await ApplicationModel.find({ missionId: doc.id });
      const placesTaken = applications.filter((application) => {
        return ["VALIDATED", "IN_PROGRESS", "DONE", "ABANDON"].includes(application.status);
      }).length;
      const placesLeft = Math.max(0, doc.placesTotal - placesTaken);
      if (doc.placesLeft !== placesLeft) {
        console.log(`Mission ${doc.id}: total ${doc.placesTotal}, left from ${doc.placesLeft} to ${placesLeft}`);
        doc.set({ placesLeft });
        await doc.save();
        await doc.index();
        count++;
      }
    } catch (e) {
      console.log(e);
    }
  });
  console.log("DONE.", count);
  process.exit(0);
})();
