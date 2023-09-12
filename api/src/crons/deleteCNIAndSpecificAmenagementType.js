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

  const total = await YoungModel.countDocuments(where);
  console.log("🚀 ~ file: deleteCNiAndSpecificAmenagementType.js:21 ~ total:", total);

  const stream = fs.createWriteStream(`${dir}/${new Date().toISOString()}_${fileName}.csv`);
  const youngIds = await YoungModel.find(where, "_id");

  for (let i = 0; i < youngIds.length; i = i + 100) {
    const subArray = youngIds.slice(i, i + 100);
    console.log(i);

    await Promise.all(
      subArray.map(async ({ _id }) => {
        await processYoung(_id, stream);
      }),
    );
  }

  console.log("---------------------------------------------------------");
  console.log(`${total} Young`);
  process.exit(0);
};

async function processYoung(youngId, stream) {
  try {
    // console.log("Processing young with ID: ", youngId);
    const young = await YoungModel.findById(youngId);
    const copyOfYoung = JSON.parse(JSON.stringify(young));
    let fileStatus = "";

    try {
      const res = await listFiles(`app/young/${young._id}/cniFiles/`);
      const CNIFileArray = res.map((e) => {
        return { Key: e.Key };
      });
      console.log("Deleting files: ", CNIFileArray);
      await deleteFilesByList(CNIFileArray);
      fileStatus = "DELETED";
    } catch (error) {
      fileStatus = "NOT_FOUND";
      console.log(error);
    }

    young.set({ latestCNIFileExpirationDate: null, latestCNIFileCategory: "deleted", cniFiles: [], "files.cniFiles": [] });
    if (young.specificAmenagment === "true") young.set({ specificAmenagmentType: "Contenu supprimé" });

    await young.save({ fromUser: { firstName: "Script de suppression des champs: Nature de l'aménagement spécifique, carte nationale d'identité" } });

    const new_line = [
      {
        youngId: young.id,
        statusPhase1: young.statusPhase1,
        status: young.status,
        specificAmenagment: young.specificAmenagment,
        oldSpecificAmenagmentType: copyOfYoung.specificAmenagmentType,
        specificAmenagmentType: young.specificAmenagmentType,
        islatestCNIFileExpirationDateDeleted: young.latestCNIFileExpirationDate === null,
        oldLatestCNIFileCategory: copyOfYoung.latestCNIFileCategory,
        latestCNIFileCategory: young.latestCNIFileCategory,
        hadCNIFilesBeforeScript: copyOfYoung?.files?.cniFiles?.length > 0,
        hadCNIFilesBeforeScriptLegacy: copyOfYoung?.cniFiles?.length > 0,
        hasCNIFilesAfterScript: young?.files?.cniFiles?.length > 0,
        hasCNIFilesAfterScriptLegacy: young?.cniFiles?.length > 0,
        fileStatus,
      },
    ];

    writeAsyncToCSV(new_line, stream);
    await slack.success({
      title: "Suppression des CNI et des aménagements spécifiques pour les jeunes des cohortes passées",
      text: `${countModified}/${countTotal} Jeunes modifiés`,
    });
  } catch (e) {
    capture(e);
    await slack.error({ title: "WARNING: Problème suppression CNI && specificAmenagmentType", text: JSON.stringify(e) });
  }
}
