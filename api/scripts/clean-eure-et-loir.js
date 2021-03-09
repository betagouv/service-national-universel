require("dotenv").config({ path: "../.env-prod" });

require("../src/mongo");
const YoungModel = require("../src/models/young");
const StructureModel = require("../src/models/structure");
const ReferentModel = require("../src/models/referent");
const MissionModel = require("../src/models/mission");
const ApplicationModel = require("../src/models/application");

const updateDepart = async (model, field) => {
  const cursor = model.find({ [field]: "Eure-et-Loire" }).cursor();
  await cursor.eachAsync(async function (doc) {
    try {
      doc.set({ [field]: "Eure-et-Loir" });
      await doc.save();
      await doc.index();
      console.log("up");
    } catch (e) {
      console.log("e", e);
    }
  });
};

(async function run() {
  console.log("Script started.");
  console.log("young.department");
  await updateDepart(YoungModel, "department");
  console.log("young.schoolDepartment");
  await updateDepart(YoungModel, "schoolDepartment");
  console.log("young.parent1Department");
  await updateDepart(YoungModel, "parent1Department");
  console.log("young.parent2Department");
  await updateDepart(YoungModel, "parent2Department");
  console.log("young.medicosocialStructureDepartment");
  await updateDepart(YoungModel, "medicosocialStructureDepartment");

  console.log("structure.department");
  await updateDepart(StructureModel, "department");

  console.log("referent.department");
  await updateDepart(ReferentModel, "department");

  console.log("mission.department");
  await updateDepart(MissionModel, "department");

  console.log("application.youngDepartment");
  await updateDepart(ApplicationModel, "youngDepartment");
  console.log("application.missionDepartment");
  await updateDepart(ApplicationModel, "missionDepartment");

  console.log("DONE.");
  process.exit(1);
})();
