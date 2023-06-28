require("dotenv").config({ path: "../.env-prod" });
require("../src/mongo");
const path = require("path");
const { capture } = require("../sentry");
const slack = require("../slack");
const YoungModel = require("../models/young");

exports.handler = async () => {
  let countTotal = 0;

  const where = {
    statusPhase1: { $in: ["DONE", "NOT_DONE", "WITHDRAWN"] },
    status: { $in: ["VALIDATED", "WITHDRAWN", "ABANDONED", "REFUSED", "NOT_ELIGIBLE", "NOT_AUTORISED"] },
    specificAmenagment: "true",
    specificAmenagmentType: { $ne: "Contenu supprimé" },
  };
  const total = await YoungModel.countDocuments(where);

  const cursor = YoungModel.find(where).sort({ status: 1 }).cursor();

  await cursor.addCursorFlag("noCursorTimeout", true).eachAsync(async function (young) {
    try {
      if (!young) {
        console.log("Young object not found.");
      } else {
        console.log(young._id);
        young.set({ specificAmenagmentType: "Contenu supprimé" });
        await young.save({ fromUser: { firstName: "Script de suppression du champ Nature de l'aménagement spécifique" } });
        countTotal++;
      }
      await slack.success({ title: "Deleting specificAmenagement for Young from old Cohort", text: `${countTotal}/${total} Youngs Modified!`});
    } catch (e) {
      capture(e);
      await slack.error({ title: "cloture deleteSpecificAmenagementType", text: JSON.stringify(e) });
    }
  });
};