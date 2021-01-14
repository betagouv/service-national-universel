require("dotenv").config({ path: "../.env-prod" });

require("../src/mongo");

const ReferentModel = require("../src/models/referent");
const YoungModel = require("../src/models/young");

// const find = async (model, regexEmail) => {
//   const cursor = model.find({ email: { $regex: regexEmail, $options: "i" } }).cursor();
//   await cursor.eachAsync(async function (doc) {
//     try {
//       console.log("delete", model, doc.email);
//     } catch (e) {
//       console.log("e", e);
//     }
//   });
// };

(async function run() {
  await YoungModel.deleteMany({ email: { $regex: /tangimds(\+.*)?@gmail\.com/, $options: "i" } });
  await ReferentModel.deleteMany({ email: { $regex: /tangimds(\+.*)?@gmail\.com/, $options: "i" } });
  await YoungModel.deleteMany({ email: { $regex: /se\.legoff(\+.*)?@gmail\.com/, $options: "i" } });
  await ReferentModel.deleteMany({ email: { $regex: /se\.legoff(\+.*)+@gmail\.com/, $options: "i" } }); // keep the account se.legoff@gmail.com
  await YoungModel.deleteMany({ email: { $regex: /raph(\+.*)?@selego\.co/, $options: "i" } });
  await ReferentModel.deleteMany({ email: { $regex: /raph(\+.*)?@selego\.co/, $options: "i" } });
  await YoungModel.deleteMany({ email: { $regex: /gabrielle\.bouxin@hotmail\.fr/, $options: "i" } });
  await YoungModel.deleteMany({ email: { $regex: /nicolas@canard\.fr/, $options: "i" } });

  await YoungModel.deleteMany({ email: { $regex: /lisadossantos77240@gmail\.fr/, $options: "i" } });

  //delete the young account with email ending with @...gouv.fr. tests made by referents
  await YoungModel.deleteMany({ email: { $regex: /gouv\.fr$/, $options: "i" } });
})();
