require("dotenv").config({ path: "../.env-prod" });
require("../src/mongo");
const path = require("path");
const dir = path.dirname(__filename);
const fileName = path.basename(__filename, ".js");
const XLSX = require("xlsx");
const fs = require("fs");
const { capture } = require("../sentry");
const slack = require("../slack");
const YoungModel = require("../models/young");

exports.handler = async () => {
  let countTotal = 0;
  console.log("ℹ️ [Delete Amenagement Type of Young] from all cohort");

  const where = {
    statusPhase1: { $in: ["DONE", "NOT_DONE", "WITHDRAWN"] },
    status: { $in: ["VALIDATED", "WITHDRAWN", "ABANDONED", "REFUSED", "NOT_ELIGIBLE", "NOT_AUTORISED"] },
    specificAmenagment: "true",
    specificAmenagmentType: { $ne: "Contenu supprimé" },
  };
  const total = await YoungModel.countDocuments(where);
  console.log("🚀 ~ file: deleteSpecificAmenagementType.js:27 ~ total:", total);

  const stream = fs.createWriteStream(`${dir}/${new Date().toISOString()}_${fileName}.csv`);
  const cursor = YoungModel.find(where).sort({ status: 1 }).cursor();

  await cursor.eachAsync(async function (young) {
    try {
      if (!young) {
        console.log("Young object not found.");
        process.exit(0);
      } else {
        const copyOfYoung = JSON.parse(JSON.stringify(young));
        console.log(young._id);
        young.set({ specificAmenagmentType: "Contenu supprimé" });
        await young.save({ fromUser: { firstName: "Script de suppression du champ Nature de l'aménagement spécifique" } });
        countTotal++;
        const new_line = [
          {
            youngId: young.id,
            statusPhase1: young.statusPhase1,
            status: young.status,
            specificAmenagment: young.specificAmenagment,
            oldSpecificAmenagmentType: copyOfYoung.specificAmenagmentType,
            specificAmenagmentType: young.specificAmenagmentType,
          },
        ];
        writeAsyncToCSV(new_line, stream);
      }
      await slack.success({ title: "Deleting specificAmenagement for Young from old Cohort", text: `${countTotal}/${total} Youngs Modified!`});
    } catch (e) {
      capture(e);
      await slack.error({ title: "cloture deleteSpecificAmenagementType", text: JSON.stringify(e) });
    }
  });

  console.log("---------------------------------------------------------");
  console.log(`${total} Young`);
  console.log(`${countTotal} modified Young`);
  process.exit(0);
};

function writeAsyncToCSV(new_line, stream) {
  const tmp = XLSX.utils.sheet_to_csv(XLSX.utils.json_to_sheet(new_line, { defval: "" }));
  if (stream.bytesWritten === 0) {
    stream.write(tmp);
  } else {
    stream.write(tmp.substring(tmp.indexOf("\n")));
  }
};