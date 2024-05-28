const { ObjectId } = require("mongoose").Types;
const fetch = require("node-fetch");

const { capture } = require("../../sentry");
const slack = require("../../slack");
const MissionModel = require("../../models/mission");
const MissionPatchModel = require("./models/missionPatch");
const config = require("config");
const { mongooseFilterForDayBefore, checkResponseStatus, getAccessToken, findAll, printResult } = require("./utils");

let token;
let result = { event: {} };

async function processPatch(patch, count, total) {
  try {
    result.missionPatchScanned = result.missionPatchScanned + 1 || 1;
    // if (count % 100 === 0) console.log(count, "/", total);
    const mission = await MissionModel.findById(patch.ref.toString());
    if (!mission) return;
    if (patch.ops.length > 0) {
      for (const op of patch.ops) {
        let operation = op.path.split("/")[1];

        let eventName = null;

        if (["name", "department", "region", "duration", "isMilitaryPreparation", "isJvaMission"].includes(operation)) {
          eventName = "MISSION_CHANGE";
        } else if (operation === "placesTotal") {
          eventName = "PLACES_TOTAL_MISSION_CHANGE";
        } else if (operation === "placesLeft") {
          eventName = "PLACES_LEFT_MISSION_CHANGE";
        } else if (operation === "createdAt") {
          eventName = "NOUVELLE_MISSION";
        } else if (operation === "mainDomain") {
          eventName = "DOMAINE_MISSION_CHANGE";
        } else if (operation === "status") {
          eventName = "STATUS_MISSION_CHANGE";
        }

        if (eventName) {
          result.event[eventName] = result.event[eventName] + 1 || 1;
          await createLog(patch, mission, eventName, eventName !== "MISSION_CHANGE" ? op.value : operation);
        }
      }
    }
  } catch (e) {
    capture(e);
    throw e;
  }
}

async function createLog(patch, actualMission, event, value) {
  const missionInfos = await actualMission.patches.find({ ref: ObjectId(patch.ref.toString()), date: { $lte: patch.date } }).sort({ date: 1 });
  let mission = rebuildMission(missionInfos);

  const anonymisedMission = new MissionModel(mission).anonymise();

  const response = await fetch(`${config.API_ANALYTICS_ENDPOINT}/log/mission`, {
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
      evenement_type: "mission",
      evenement_valeur: value.toString() || "",
      mission_id: patch.ref.toString(),
      mission_structureId: actualMission.structureId.toString(),
      mission_status: mission.status || actualMission.status,
      mission_nom: mission.name || actualMission.name,
      mission_departement: mission.department || actualMission.department,
      mission_region: mission.region || actualMission.region,
      mission_domaine: mission.mainDomain || actualMission.mainDomain,
      mission_duree: mission.duration || actualMission.duration,
      mission_placesTotal: mission.placesTotal || actualMission.placesTotal,
      mission_placesRestantes: mission.placesLeft || actualMission.placesLeft,
      mission_preparationMilitaire: mission.isMilitaryPreparation || actualMission.isMilitaryPreparation,
      mission_JVA: mission.isJvaMission || actualMission.isJvaMission,
      date: patch.date,
      raw_data: anonymisedMission,
    }),
  });

  const successResponse = checkResponseStatus(response);
  return successResponse.json();
}

const rebuildMission = (missionInfos) => {
  let mission = {};
  for (const missionInfo of missionInfos) {
    for (const op of missionInfo.ops) {
      let operation = op.path.split("/")[1];
      mission[operation] = op.value;
    }
  }
  return mission;
};

exports.handler = async () => {
  try {
    token = await getAccessToken(config.API_ANALYTICS_ENDPOINT, config.API_ANALYTICS_API_KEY);

    await findAll(MissionPatchModel, mongooseFilterForDayBefore(), processPatch);
    await slack.info({
      title: "✅ Mission Logs",
      text: `${result.missionPatchScanned} missions were scanned:\n ${printResult(result.event)}`,
    });
  } catch (e) {
    slack.error({ title: "❌ Mission Logs", text: e });
    capture(e);
    throw e;
  }
};

// Script de rattrapage manuel
// commande terminal : node -e "require('./mission').manualHandler('2023-08-17', '2023-08-18')"
exports.manualHandler = async (startDate, endDate) => {
  try {
    token = await getAccessToken(config.API_ANALYTICS_ENDPOINT, config.API_ANALYTICS_API_KEY);

    await findAll(MissionPatchModel, { date: { $gte: new Date(startDate), $lt: new Date(endDate) } }, processPatch);

    console.log(result);
  } catch (e) {
    console.log(e);
  }
};
