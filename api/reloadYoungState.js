require("dotenv").config({ path: "./.env-staging" });
require("./src/mongo");

const youngModel = require("./src/models/young");

(async () => {
  const young = await youngModel.findOne({ _id: "6070277d9c806b07161e9966" });
  if (young) {
    young.set({ rulesYoung: "false", youngPhase1Agreement: "false", convocationFileDownload: "false", cohesionStayMedicalFileDownload: "false" });
    await young.save();
  }
  process.exit(0);
})();
