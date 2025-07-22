require("../mongo");
require("dotenv").config({ path: "../../.env-prod" });

const TicketModel = require("../models/ticket");

(async () => {
  try {
    for await (let ticket of TicketModel.find({ agentId: "6221baf75282c875b597b6f2", status: { $ne: "CLOSED" }, formSubjectStep1: { $ne: "QUESTION" } })) { // TODO: removeID
      console.log("https://admin-support.snu.gouv.fr/ticket/" + ticket._id);
    }

    console.log("DONE");
    process.exit(0);
  } catch (e) {
    console.log("e", e);
  }
})();
