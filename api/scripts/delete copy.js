require("dotenv").config({ path: "../.env-prod" });

require("../src/mongo");
const YoungModel = require("../src/models/young");
const StructureModel = require("../src/models/structure");
const MissionModel = require("../src/models/mission");

(async function fetch() {

  // await YoungModel.findByIdAndDelete("5feb32c23f932d763ba0085b");
  // await YoungModel.findByIdAndDelete("5feb325a3f932d763ba00858");
  // await YoungModel.findByIdAndDelete("5feb11a301a3ba58b485d154");


})();

// (async function () {
//   await YoungModel.findOneAndUpdate("se.legoff@gmail.com", { phase: "INSCRIPTION" });
//   console.log("updated", )
// })();

//
