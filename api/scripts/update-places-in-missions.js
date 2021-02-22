require("dotenv").config({ path: "../.env-staging" });

require("../src/mongo");
const ApplicationModel = require("../src/models/application");
const MissionModel = require("../src/models/mission");

(async function run() {
  const cursor = MissionModel.find({}).cursor();
  await cursor.eachAsync(async function (doc) {
    try {
      // Get all application for the mission
      const applications = await ApplicationModel.find({ missionId: doc.id });
      const placesTaken = applications.filter((application) => {
        return ["VALIDATED", "IN_PROGRESS", "DONE", "ABANDON"].includes(application.status);
      }).length;

      if (doc.placesTaken !== placesTaken) {
        const placesLeft = Math.max(0, doc.placesTotal - placesTaken);
        console.log(`Mission ${doc.id}: total ${doc.placesTotal}, taken from ${doc.placesTaken} to ${placesTaken}, left: ${placesLeft}`);
        await doc.set({ placesTaken, placesLeft });
        await doc.save();
        await doc.index();
      }
    } catch (e) {
      console.log(e);
    }
  });
  console.log("DONE.");
  process.exit(0);
})();
