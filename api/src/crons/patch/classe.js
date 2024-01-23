require("dotenv").config({ path: "./../../../.env-prod" });
require("../../mongo");

const { ObjectId } = require("mongoose").Types;
const fetch = require("node-fetch");
const { getAge } = require("snu-lib");

const { capture } = require("../../sentry");
const slack = require("../../slack");
const ClasseModel = require("../../models/cle/classe");
const ClassePatchModel = require("./models/classePatch");
const { API_ANALYTICS_ENDPOINT, API_ANALYTICS_API_KEY } = require("../../config.js");
const { mongooseFilterForDayBefore, checkResponseStatus, getAccessToken, findAll, printResult } = require("./utils");

let token;
const result = { event: {} };

async function processPatch(patch, count, total) {
  try {
    result.ClassePatchScanned = result.classePatchScanned + 1 || 1;
    // if (count % 100 === 0) console.log(count, "/", total);
    const actualClasse = await ClasseModel.findById(patch.ref.toString());
    if (!actualClasse) return;
    if (patch.ops.length > 0) {
      for (const op of patch.ops) {
        let operation = op.path.split("/")[1];

        let eventName = null;

        switch (operation) {
          case "status":
            eventName = "STATUS_CHANGE";
            break;
          case "statusPhase1":
            eventName = "STATUS_PHASE1_CHANGE";
            break;
        }

        if (eventName) {
          result.event[eventName] = result.event[eventName] + 1 || 1;
          await createLog(patch, actualClasse, eventName, op.value);
        }
      }
    }
  } catch (e) {
    capture(e);
    throw e;
  }
}

async function createLog(patch, actualClasse, event, value) {
  const classeInfos = await actualClasse.patches.find({ ref: ObjectId(patch.ref.toString()), date: { $lte: patch.date } }).sort({ date: 1 });
  let classe = rebuildClasse(classeInfos);

  const age = getAge(classe?.birthdateAt || actualClasse?.birthdateAt);

  const response = await fetch(`${API_ANALYTICS_ENDPOINT}/log/classe`, {
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
      evenement_valeur: value || "",
      evenement_type: "classe",
      classe_id: classe?._id || actualClasse?._id,
      classe_etablissement_id: classe?.etablissementId || actualClasse?.etablissementId,
      classe_name: classe?.name || actualClasse?.name,
      classe_type: classe?.filiere || actualClasse?.filiere,
      date: patch.date,
      raw_data: classe,
    }),
  });

  const successResponse = checkResponseStatus(response);
  return successResponse.json();
}

const rebuildClasse = (classeInfos) => {
  let classe = {};
  for (const classeInfo of classeInfos) {
    for (const op of classeInfo.ops) {
      let operation = op.path.split("/")[1];
      classe[operation] = op.value;
    }
  }
  return classe;
};

exports.handler = async () => {
  try {
    token = await getAccessToken(API_ANALYTICS_ENDPOINT, API_ANALYTICS_API_KEY);

    await findAll(ClassePatchModel, mongooseFilterForDayBefore(), processPatch);
    await slack.info({
      title: "✅ Classe Logs",
      text: `${result.classePatchScanned} classe patches were scanned:\n ${printResult(result.event)}`,
    });
  } catch (e) {
    slack.error({ title: "❌ Classe Logs", text: `${JSON.toString(e)}` });
    capture(e);
  }
};

// Script de rattrapage manuel
// commande terminal : node -e "require('./classe').manualHandler('2023-12-17', '2023-12-18')"
exports.manualHandler = async (startDate, endDate) => {
  try {
    token = await getAccessToken(API_ANALYTICS_ENDPOINT, API_ANALYTICS_API_KEY);

    await findAll(ClassePatchModel, { date: { $gte: new Date(startDate), $lt: new Date(endDate) } }, processPatch);

    console.log(result);
  } catch (e) {
    console.log(e);
  }
};
