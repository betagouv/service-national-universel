require("../Databases/Mongo/mongo");
const { capture } = require("../Services/sentry");
const slack = require("../Services/slack");
const YoungModel = require("../Databases/Mongo/Models/young");
const { deleteSensitiveData } = require("../../services/gdpr");

let countTotal = 0;
let countModified = 0;
exports.handler = async () => {
  const where = {
    statusPhase1: { $in: ["DONE", "NOT_DONE", "WITHDRAWN"] },
    status: { $in: ["WITHDRAWN", "ABANDONED", "REFUSED", "NOT_ELIGIBLE", "NOT_AUTORISED"] },
  };
  const total = await YoungModel.countDocuments(where);
  console.log("🚀 ~ file: deleteCNiAndSpecificAmenagementType.js:21 ~ total:", total);

  const youngIds = await YoungModel.find(where, "_id");
  try {
    for (let i = 0; i < youngIds.length; i = i + 100) {
      const subArray = youngIds.slice(i, i + 100);
      console.log(i);

      await Promise.all(
        subArray.map(async ({ _id }) => {
          await deleteSensitiveData(_id);
          countModified++;
        }),
      );
      countTotal += subArray.length;
    }

    await slack.success({
      title: "Suppression des CNI et des aménagements spécifiques pour les jeunes des cohortes passées",
      text: `${countModified}/${countTotal} Jeunes modifiés`,
    });
  } catch (e) {
    capture(e);
    await slack.error({ title: "WARNING: Problème suppression CNI && specificAmenagmentType", text: JSON.stringify(e) });
  }
};
