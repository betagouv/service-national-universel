require("dotenv").config({ path: "../.env-prod" });
require("../mongo");
const { capture } = require("../sentry");
const slack = require("../slack");
const YoungModel = require("../models/young");
const { deleteFile } = require("../utils/index");

exports.handler = async () => {
  let countTotal = 0;
  let countModified = 0;

  const where = {
    statusPhase1: { $in: ["DONE", "NOT_DONE", "WITHDRAWN"] },
    status: { $in: ["WITHDRAWN", "ABANDONED", "REFUSED", "NOT_ELIGIBLE", "NOT_AUTORISED"] },
  };

  const cursor = YoungModel.find(where).cursor();

  await cursor.addCursorFlag("noCursorTimeout", true).eachAsync(async function (young) {
    try {
      if (!young) {
        return;
      } else {
        countTotal++;
        for (const file of young.files.cniFiles) {
          await deleteFile(`/young/${young._id}/cniFiles/${file._id}`);
        }
        young.set({ latestCNIFileExpirationDate: null, latestCNIFileCategory: "deleted" });
        if (young.specificAmenagment === "true") {
          young.set({ specificAmenagmentType: "Contenu supprimé" });
        }
        if (young.specificAmenagmentType === "Contenu supprimé" || young.latestCNIFileCategory === "deleted") {
          countModified++;
        }
        await young.save({ fromUser: { firstName: "Script de suppression du champ Nature de l'aménagement spécifique" } });
      }
      await slack.success({
        title: "Suppression des CNI et des aménagements spécifiques pour les jeunes des cohortes passées",
        text: `${countModified}/${countTotal} Jeunes modifiés`,
      });
    } catch (e) {
      capture(e);
      await slack.error({ title: "WARNING: Problème suppression CNI && specificAmenagmentType", text: JSON.stringify(e) });
    }
  });
};
