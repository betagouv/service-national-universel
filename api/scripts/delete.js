require("dotenv").config({ path: "../.env-prod" });

require("../src/mongo");

const ReferentModel = require("../src/models/referent");

(async function fetch() {
  // await ReferentModel.findOneAndDelete({ email: "gabrielle.bouxin@gmail.com" });
  // await ReferentModel.findOneAndDelete({ email: "gabrielle.bxn@gmail.com" });
  // const a = await ReferentModel.findOne({ email: "gabrielle.bouxin@beta.gouv.fr" });
  // await a.index();
  // await YoungModel.findByIdAndDelete("5feb325a3f932d763ba00858");
  // await YoungModel.findByIdAndDelete("5feb11a301a3ba58b485d154");
})();

// (async function () {
//   await YoungModel.findOneAndUpdate("se.legoff@gmail.com", { phase: "INSCRIPTION" });
//   console.log("updated", )
// })();

//
