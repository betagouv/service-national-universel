require("dotenv").config({ path: "./../../../.env-prod" });
require("../../mongo");

const { ObjectId } = require("mongoose").Types;
const fetch = require("node-fetch");

const { capture } = require("../../sentry");
const slack = require("../../slack");
const EtablissementModel = require("../../models/cle/etablissement");
const EtablissementPatchModel = require("./models/etablissementPatch");
const { API_ANALYTICS_ENDPOINT, API_ANALYTICS_API_KEY } = require("../../config.js");
const { mongooseFilterForDayBefore, checkResponseStatus, getAccessToken, findAll, printResult } = require("./utils");

let token;
const result = { event: {} };

async function processPatch(patch, count, total) {
  try {
    result.etablissementPatchScanned = result.etablissementPatchScanned + 1 || 1;
    if (count % 100 === 0) console.log(count, "/", total);

    const etablissement = await EtablissementModel.findById(patch.ref.toString());
    if (!etablissement) return;
    if (patch.ops.length > 0) {
      for (const op of patch.ops) {
        await createLogEtablissement(patch, etablissement, op.value);
      }
    }
  } catch (e) {
    capture(e);
    throw e;
  }
}

async function createLogEtablissement(patch, actualEtablissement, value) {
  const etablissementInfos = await actualEtablissement.patches.find({ ref: ObjectId(patch.ref.toString()), date: { $lte: patch.date } }).sort({ date: 1 });
  let etablissement = rebuildEtablissement(etablissementInfos);

  const response = await fetch(`${API_ANALYTICS_ENDPOINT}/log/etablissement`, {
    method: "POST",
    redirect: "follow",
    headers: {
      Accept: "application/json, text/plain, */*",
      "User-Agent": "*",
      "Content-Type": "application/json",
      "x-access-token": token,
    },
    body: JSON.stringify({
      evenement_type: "etablissement",
      evenement_valeur: String(value) || "",
      etablissement_id: patch.ref.toString(),
      etablissement_name: etablissement.name || actualEtablissement.name,
      etablissement_department: etablissement.department || actualEtablissement.department,
      etablissement_region: etablissement.region || actualEtablissement.region,
      date: patch.date,
      raw_data: etablissement,
    }),
  });

  const successResponse = checkResponseStatus(response);
  return successResponse.json();
}

const rebuildEtablissement = (etablissementInfos) => {
  let etablissement = {};
  for (const etablissementInfo of etablissementInfos) {
    for (const op of etablissementInfo.ops) {
      let operation = op.path.split("/")[1];
      etablissement[operation] = op.value;
    }
  }
  return etablissement;
};

exports.handler = async () => {
  try {
    token = await getAccessToken(API_ANALYTICS_ENDPOINT, API_ANALYTICS_API_KEY);

    await findAll(EtablissementPatchModel, mongooseFilterForDayBefore(), processPatch);
    await slack.info({
      title: "✅ Etablissement Logs",
      text: `${result.etablissementPatchScanned} etablissement patches were scanned:\n ${printResult(result.event)}`,
    });
  } catch (e) {
    slack.error({ title: "❌ Etablissement Logs", text: e });
    capture(e);
  }
};

// Script de rattrapage manuel
// commande terminal : node -e "require('./etablissement').manualHandler('2023-12-19', '2023-12-20')"
exports.manualHandler = async (startDate, endDate) => {
  try {
    token = await getAccessToken(API_ANALYTICS_ENDPOINT, API_ANALYTICS_API_KEY);

    await findAll(EtablissementPatchModel, { date: { $gte: new Date(startDate), $lt: new Date(endDate) } }, processPatch);

    console.log(result);
  } catch (e) {
    console.log(e);
  }
};
