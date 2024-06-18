const { ObjectId } = require("mongoose").Types;
const fetch = require("node-fetch");

const { capture } = require("../../sentry");
const slack = require("../../slack");

const ApplicationModel = require("../../models/application");
const ApplicationPatchModel = require("./models/applicationPatch");

const config = require("config");
const { mongooseFilterForDayBefore, checkResponseStatus, getAccessToken, findAll, printResult } = require("./utils");

let token;
const result = { event: {} };

async function processPatch(patch, count, total) {
  try {
    result.applicationPatchScanned = result.applicationPatchScanned + 1 || 1;
    // if (count % 100 === 0) console.log(count, "/", total);
    const actualApplication = await ApplicationModel.findById(patch.ref.toString());
    if (!actualApplication) return;
    if (patch.ops.length > 0) {
      for (const op of patch.ops) {
        let operation = op.path.split("/")[1];

        let eventName = null;

        if (operation === "status") {
          eventName = "CANDIDATURE_STATUS_CHANGE";
        } else if (operation === "createdAt") {
          eventName = "NOUVELLE_CANDIDATURE";
        }

        if (eventName) {
          result.event[eventName] = result.event[eventName] + 1 || 1;
          await createLog(patch, actualApplication, eventName, eventName !== "CANDIDATURE_CHANGE" ? op.value : operation);
        }
      }
    }
  } catch (e) {
    capture(e);
    throw e;
  }
}

async function createLog(patch, actualApplication, event, value) {
  const applicationInfos = await actualApplication.patches.find({ ref: ObjectId(patch.ref.toString()), date: { $lte: patch.date } }).sort({ date: 1 });
  let application = rebuildApplication(applicationInfos);

  const anonymizedApplication = new ApplicationModel(application).anonymise();

  const response = await fetch(`${config.API_ANALYTICS_ENDPOINT}/log/application`, {
    method: "POST",
    redirect: "follow",
    headers: {
      Accept: "application/json, text/plain, */*",
      "User-Agent": "*",
      "Content-Type": "application/json",
      "x-access-token": token,
    },
    body: JSON.stringify({
      evenement_nom: event,
      evenement_type: "application",
      evenement_valeur: value.toString() || "",
      candidature_id: actualApplication._id.toString(),
      candidature_user_id: actualApplication.youngId.toString(),
      candidature_mission_id: actualApplication.missionId.toString(),
      candidature_structure_id: actualApplication.structureId.toString(),
      candidature_status: application.status || actualApplication.status,
      date: patch.date,
      raw_data: anonymizedApplication,
    }),
  });

  const successResponse = checkResponseStatus(response);
  return successResponse.json();
}

const rebuildApplication = (applicationInfos) => {
  let application = {};
  for (const applicationInfo of applicationInfos) {
    for (const op of applicationInfo.ops) {
      let operation = op.path.split("/")[1];
      application[operation] = op.value;
    }
  }
  return application;
};

exports.handler = async () => {
  try {
    token = await getAccessToken(config.API_ANALYTICS_ENDPOINT, config.API_ANALYTICS_API_KEY);

    await findAll(ApplicationPatchModel, mongooseFilterForDayBefore(), processPatch);
    await slack.info({
      title: "✅ Application Logs",
      text: `${result.applicationPatchScanned} application patches were scanned:\n ${printResult(result.event)}`,
    });
  } catch (e) {
    slack.error({ title: "❌ Application Logs", text: e });
    capture(e);
    throw e;
  }
};

// Script de rattrapage manuel
// commande terminal : node -e "require('./application').manualHandler('2023-08-17', '2023-08-18')"
exports.manualHandler = async (startDate, endDate) => {
  try {
    token = await getAccessToken(config.API_ANALYTICS_ENDPOINT, config.API_ANALYTICS_API_KEY);

    await findAll(ApplicationPatchModel, { date: { $gte: new Date(startDate), $lt: new Date(endDate) } }, processPatch);

    console.log(result);
  } catch (e) {
    console.log(e);
  }
};
