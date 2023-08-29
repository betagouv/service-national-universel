require("dotenv").config({ path: "./../../../.env-prod" });
require("../../mongo");

const { ObjectId } = require("mongodb");
const fetch = require("node-fetch");
const { isInRuralArea, getAge } = require("snu-lib");

const { capture } = require("../../sentry");
const slack = require("../../slack");
const YoungModel = require("../../models/young");
const YoungPatchModel = require("./models/youngPatch");
const { API_ANALYTICS_ENDPOINT, API_ANALYTICS_API_KEY } = require("../../config.js");
const { mongooseFilterForDayBefore, checkResponseStatus, getAccessToken, findAll, printResult } = require("./utils");

let token;
const result = { event: {} };

async function processPatch(patch, count, total) {
  try {
    result.youngPatchScanned = result.youngPatchScanned + 1 || 1;
    // if (count % 100 === 0) console.log(count, "/", total);
    const actualYoung = await YoungModel.findById(patch.ref.toString());
    if (!actualYoung) return;
    if (patch.ops.length > 0) {
      for (const op of patch.ops) {
        let operation = op.path.split("/")[1];

        let eventName = null;

        if (["gender", "birthdateAt", "grade", "situation", "qpv", "department", "region", "handicap", "populationDensity"].includes(operation)) {
          eventName = "JEUNE_CHANGE";
        } else {
          switch (operation) {
            //Inscription step
            case "inscriptionStep2023":
              eventName = "STEP_INSCRIPTION_CHANGE";
              break;
            case "reinscriptionStep2023":
              eventName = "STEP_REINSCRIPTION_CHANGE";
              break;
            //General status
            case "status":
              eventName = "STATUS_CHANGE";
              break;
            //SEJOUR status
            case "statusPhase1":
              eventName = "STATUS_PHASE1_CHANGE";
              break;
            //MIG status
            case "statusPhase2":
              eventName = "STATUS_PHASE2_CHANGE";
              break;
            case "statusPhase3":
              eventName = "STATUS_PHASE3_CHANGE";
              break;
            //Presence sejour
            case "cohesionStayPresence":
              eventName = "PRESENCE_ARRIVEE";
              break;
            case "cohort":
              eventName = "COHORT_CHANGE";
              break;
            case "phase2NumberHoursDone":
              eventName = "HEURE_PHASE2_CHANGE";
              break;
          }
        }

        if (eventName) {
          result.event[eventName] = result.event[eventName] + 1 || 1;
          await createLog(patch, actualYoung, eventName, op.value);
        }
      }
    }
  } catch (e) {
    capture(e);
    throw e;
  }
}

async function createLog(patch, actualYoung, event, value) {
  const youngInfos = await actualYoung.patches.find({ ref: ObjectId(patch.ref.toString()), date: { $lte: patch.date } }).sort({ date: 1 });
  let young = rebuildYoung(youngInfos);

  const age = getAge(young?.birthdateAt || actualYoung?.birthdateAt);

  const response = await fetch(`${API_ANALYTICS_ENDPOINT}/log/young`, {
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
      evenement_type: "young",
      evenement_valeur: value || "",
      user_id: patch.ref.toString(),
      user_genre: young?.gender || actualYoung?.gender,
      user_date_de_naissance: young?.birthdateAt || actualYoung?.birthdateAt?.toString(),
      user_classe: young?.grade || actualYoung?.grade,
      user_ecole_situation: young?.situation || actualYoung?.situation,
      user_handicap_situation: young?.handicap || actualYoung?.handicap,
      user_QPV: young?.qpv || actualYoung?.qpv,
      user_departement: young?.department || actualYoung?.department,
      user_region: young?.region || actualYoung?.region,
      user_cohorte: young?.cohort || actualYoung?.cohort,
      user_rural: isInRuralArea(young?.populationDensity ? young : actualYoung),
      user_age: age !== "?" ? age : undefined,
      date: patch.date,
      raw_data: young,
    }),
  });

  const successResponse = checkResponseStatus(response);
  return successResponse.json();
}

const rebuildYoung = (youngInfos) => {
  let young = {};
  for (const youngInfo of youngInfos) {
    for (const op of youngInfo.ops) {
      let operation = op.path.split("/")[1];
      young[operation] = op.value;
    }
  }
  return young;
};

exports.handler = async () => {
  try {
    token = await getAccessToken(API_ANALYTICS_ENDPOINT, API_ANALYTICS_API_KEY);

    await findAll(YoungPatchModel, mongooseFilterForDayBefore(), processPatch);
    await slack.info({
      title: "✅ Young Logs",
      text: `<@U044RT0N3JR> ${result.youngPatchScanned} young patches were scanned:\n ${printResult(result.event)}`,
    });
  } catch (e) {
    slack.error({ title: "❌ Young Logs", text: `<@U044RT0N3JR> ${JSON.toString(e)}` });
    capture(e);
  }
};

// Script de rattrapage manuel
// commande terminal : node -e "require('./young').manualHandler('2023-08-17', '2023-08-18')"
exports.manualHandler = async (startDate, endDate) => {
  try {
    token = await getAccessToken(API_ANALYTICS_ENDPOINT, API_ANALYTICS_API_KEY);

    await findAll(YoungPatchModel, { date: { $gte: new Date(startDate), $lt: new Date(endDate) } }, processPatch);

    console.log(result);
  } catch (e) {
    console.log(e);
  }
};
