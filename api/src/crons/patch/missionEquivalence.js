const { ObjectId } = require("mongoose").Types;
const fetch = require("node-fetch");

const { capture } = require("../../sentry");
const slack = require("../../slack");

const { StructureModel, MissionEquivalenceModel } = require("../../models");
const MissionEquivalencePatchModel = require("./models/missionEquivalencePatch");

const config = require("config");
const { mongooseFilterForDayBefore, checkResponseStatus, getAccessToken, findAll, printResult } = require("./utils");

let token;
const result = { event: {} };

async function processPatch(patch, count, total) {
  try {
    result.missionEquivalencePatchScanned = result.missionEquivalencePatchScanned + 1 || 1;
    if (count % 100 === 0) console.log(count, "/", total);
    const actualMissionEquivalence = await MissionEquivalenceModel.findById(patch.ref.toString());
    if (!actualMissionEquivalence) return;
    if (patch.ops.length > 0) {
      for (const op of patch.ops) {
        let operation = op.path.split("/")[1];
        let eventName = null;

        if (operation === "status") {
          eventName = "EQUIVALENCE_MIG_STATUS_CHANGE";
        }

        if (eventName) {
          result.event[eventName] = result.event[eventName] + 1 || 1;
          await createLog(patch, actualMissionEquivalence, eventName, op.value);
        }
      }
    }
  } catch (e) {
    capture(e);
    throw e;
  }
}

async function createLog(patch, actualMissionEquivalence, event, value) {
  const missionEquivalenceInfos = await actualMissionEquivalence.patches.find({ ref: ObjectId(patch.ref.toString()), date: { $lte: patch.date } }).sort({ date: 1 });
  let missionEquivalence = rebuildMissionEquivalence(missionEquivalenceInfos);
  const structure = await StructureModel.findOne({ name: actualMissionEquivalence.structureName });

  const anonymisedMissionEquivalence = new MissionEquivalenceModel(missionEquivalence).anonymise();

  const response = await fetch(`${config.API_ANALYTICS_ENDPOINT}/log/mission-equivalence`, {
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
      evenement_type: "missionEquivalence",
      evenement_valeur: value || "",
      candidature_id: actualMissionEquivalence._id,
      candidature_user_id: actualMissionEquivalence.youngId,
      candidature_structure_name: actualMissionEquivalence.structureName,
      candidature_structure_id: structure?._id || "",
      candidature_status: missionEquivalence.status || actualMissionEquivalence.status,
      date: patch.date,
      raw_data: anonymisedMissionEquivalence,
      type_engagement: actualMissionEquivalence.type || "",
    }),
  });

  const successResponse = checkResponseStatus(response);
  return successResponse.json();
}

const rebuildMissionEquivalence = (missionEquivalenceInfos) => {
  let missionEquivalence = {};
  for (const missionEquivalenceInfo of missionEquivalenceInfos) {
    for (const op of missionEquivalenceInfo.ops) {
      let operation = op.path.split("/")[1];
      missionEquivalence[operation] = op.value;
    }
  }
  return missionEquivalence;
};

exports.handler = async () => {
  try {
    token = await getAccessToken(config.API_ANALYTICS_ENDPOINT, config.API_ANALYTICS_API_KEY);

    await findAll(MissionEquivalencePatchModel, mongooseFilterForDayBefore(), processPatch);
    await slack.info({
      title: "✅ Mission Equivalence",
      text: `${result.missionEquivalencePatchScanned} mission equivalence patches were scanned:\n ${printResult(result.event)}`,
    });
  } catch (e) {
    slack.error({ title: "❌ Mission Equivalence Logs", text: e });
    capture(e);
    throw e;
  }
};

// Script de rattrapage manuel
// commande terminal : node -e "require('./missionEquivalence').manualHandler('2023-08-17', '2023-08-18')"
exports.manualHandler = async (startDate, endDate) => {
  try {
    token = await getAccessToken(config.API_ANALYTICS_ENDPOINT, config.API_ANALYTICS_API_KEY);

    await findAll(MissionEquivalencePatchModel, { date: { $gte: new Date(startDate), $lt: new Date(endDate) } }, processPatch);

    console.log(result);
  } catch (e) {
    console.log(e);
  }
};
