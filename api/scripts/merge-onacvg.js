require("dotenv").config({ path: "../.env-prod" });
require("../src/mongo");

const ReferentModel = require("../src/models/referent");
const ApplicationModel = require("../src/models/application");
const MissionModel = require("../src/models/mission");
const StructureModel = require("../src/models/structure");

(async function run() {
  await StructureModel.deleteOne({ _id: "6033859428cc1009a723d721" });
  console.log("DONE.");
  process.exit(0);
  const structureGhost = await StructureModel.findOne({ _id: "6033859428cc1009a723d721" });
  const structure = await StructureModel.findOne({ _id: "6033859428cc1009a723d8f2" });
  console.log(structureGhost);
  console.log(structure);

  const missions = await MissionModel.find({ structureId: structureGhost._id });
  if (missions.length) {
    for (let i = 0; i < missions.length; i++) {
      let m = missions[i];
      m.set({ structureId: structure._id, structureName: structure.name });
      console.log({ m });
      await m.save();
      await m.index();
      const applications = await ApplicationModel.find({ missionId: m._id });
      if (applications.length) {
        for (let i = 0; i < applications.length; i++) {
          let a = applications[i];
          a.set({ structureId: structure._id });
          console.log({ a });
          await a.save();
          await a.index();
        }
      }
    }
  }

  const referents = await ReferentModel.find({ structureId: structureGhost._id });
  if (referents.length) {
    for (let i = 0; i < referents.length; i++) {
      let r = referents[i];
      r.set({ structureId: structure._id });
      console.log({ r });
      await r.save();
      await r.index();
    }
  }

  console.log("DONE.");
  process.exit(0);
})();
