require("dotenv").config({ path: "../.env-staging" });

require("../src/mongo");
const ApplicationModel = require("../src/models/application");
const MissionModel = require("../src/models/mission");
const ReferentModel = require("../src/models/referent");

(async function run() {
  const cursor = MissionModel.find({}).cursor();
  await cursor.eachAsync(async function (mission) {
    try {
      if (mission.tutorId) {
        // Get tutor for the mission
        const tutor = await ReferentModel.findOne({ _id: mission.tutorId });
        if (tutor) {
          console.log(`Update mission #${mission._id} tutor : ${mission.tutorId} : ${tutor.firstName} ${tutor.lastName}`);
          mission.set({ tutorName: `${tutor.firstName} ${tutor.lastName}` });
          await mission.save();
          await mission.index();

          // Then update applications
          const applications = await ApplicationModel.find({ missionId: mission._id });
          if (applications && applications.length) {
            for (let application of applications) {
              console.log(`Update application #${application._id} tutor : ${mission.tutorId} : ${tutor.firstName} ${tutor.lastName}`);
              application.set({ tutorId: mission.tutorId, tutorName: `${tutor.firstName} ${tutor.lastName}` });
              await application.save();
              await application.index();
            }
          }
        }
      } else {
        console.log(`Skip: mission ${mission._id} (already done)`);
      }
    } catch (e) {
      console.log(e);
    }
  });
  console.log("DONE.");
  process.exit(0);
})();
