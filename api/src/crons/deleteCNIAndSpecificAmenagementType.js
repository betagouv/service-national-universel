require("dotenv").config({ path: "../.env-prod" });
require("../mongo");
const { capture } = require("../sentry");
const slack = require("../slack");
const YoungModel = require("../models/young");

exports.handler = async () => {
  let countTotal = 0;

  const where = {
    statusPhase1: { $in: ["DONE", "NOT_DONE", "WITHDRAWN"] },
    status: { $in: ["VALIDATED", "WITHDRAWN", "ABANDONED", "REFUSED", "NOT_ELIGIBLE", "NOT_AUTORISED"] },
    cohort: { $ne: ["Juin 2023","Juillet 2023", "à venir"] },
  };
  const total = await YoungModel.countDocuments(where);

  const cursor = YoungModel.find(where).sort({ status: 1 }).cursor();

  await cursor.addCursorFlag("noCursorTimeout", true).eachAsync(async function (young) {
    try {
      if (!young) {
        console.log("Young object not found.");
        process.exit(0);
      } else {
        young.set({ latestCNIFileExpirationDate: null, latestCNIFileCategory: "Deleted", files: { cniFiles: [] } });
        if (young.specificAmenagment === "true") {
          young.set({ specificAmenagmentType: "Contenu supprimé" });
        }
        await young.save({ fromUser: { firstName: "Script de suppression du champ Nature de l'aménagement spécifique" } });
        countTotal++;
      }
      await slack.success({ title: "Suppression des CNI et des aménagements spécifiques pour les jeunes des cohortes passées", text: `${countTotal}/${total} Jeunes modifiés` });
    } catch (e) {
      capture(e);
      await slack.error({ title: "WARNING: Problème suppression CNI && specificAmenagmentType", text: JSON.stringify(e) });
    }
  });
};
