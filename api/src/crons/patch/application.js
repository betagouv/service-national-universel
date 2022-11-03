require("../../mongo");

const { ObjectId } = require("mongodb");
const fetch = require("node-fetch");
const mongoose = require("mongoose");

const { capture } = require("../../sentry");
const slack = require("../../slack");

const ApplicationModel = require("../../models/application");
const { API_ANALYTICS_ENDPOINT, API_ANALYTICS_API_KEY } = require("../../config.js");
const { mongooseFilterForDayBefore, checkResponseStatus, getAccessToken, findAll, printResult } = require("./utils");

let token;
const result = { event: {} };

async function process(patch, count, total) {
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
    capture(`Couldn't create application log for patch id : ${patch._id}`, JSON.stringify(e));
    throw e;
  }
}

async function createLog(patch, actualApplication, event, value) {
  const applicationInfos = await actualApplication.patches.find({ ref: ObjectId(patch.ref.toString()), date: { $lte: patch.date } }).sort({ date: 1 });
  let application = rebuildApplication(applicationInfos);

  const response = await fetch(`${API_ANALYTICS_ENDPOINT}/log/application`, {
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
      raw_data: application,
    }),
  });

  const successResponse = checkResponseStatus(response);
  return await successResponse.json();
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
    token = await getAccessToken(API_ANALYTICS_ENDPOINT, API_ANALYTICS_API_KEY);

    const application_patches = mongoose.model("application_patches", new mongoose.Schema({}, { collection: "application_patches" }));
    await findAll(application_patches, mongooseFilterForDayBefore(), process);
    slack.info({
      title: "✅ Application Logs",
      text: `${result.applicationPatchScanned} application patches were scanned:\n ${printResult(result.event)}`,
    });
  } catch (e) {
    capture("Error during creation of application patch logs", JSON.stringify(e));
    slack.error({ title: "❌ Application Logs", text: JSON.stringify(e) });
  }
};
