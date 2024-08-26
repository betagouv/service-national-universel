const { ObjectId } = require("mongoose").Types;
const fetch = require("node-fetch");

const { capture } = require("../../sentry");
const slack = require("../../slack");
const { StructureModel } = require("../../models");
const StructurePatchModel = require("./models/structurePatch");
const config = require("config");
const { mongooseFilterForDayBefore, checkResponseStatus, getAccessToken, findAll, printResult } = require("./utils");

let token;
const result = { event: {} };

async function processPatch(patch, count, total) {
  try {
    result.structurePatchScanned = result.structurePatchScanned + 1 || 1;
    const structure = await StructureModel.findById(patch.ref.toString());
    if (!structure) return;
    if (patch.ops.length > 0) {
      for (const op of patch.ops) {
        let operation = op.path.split("/")[1];

        let eventName = null;

        if (["status", "legalStatus", "types", "sousType", "name", "department", "region", "isMilitaryPreparation", "isNetwork"].includes(operation)) {
          eventName = "STRUCTURE_CHANGE";
        } else if (operation === "createdAt") {
          eventName = "NOUVELLE_STRUCTURE";
        }

        if (eventName) {
          result.event[eventName] = result.event[eventName] + 1 || 1;
          await createLog(patch, structure, eventName, eventName === "STRUCTURE_CHANGE" ? operation : op.value);
        }
      }
    }
  } catch (e) {
    capture(e);
    throw e;
  }
}

async function createLog(patch, actualStructure, event, value) {
  const structInfos = await actualStructure.patches.find({ ref: ObjectId(patch.ref.toString()), date: { $lte: patch.date } }).sort({ date: 1 });
  let structure = rebuildStruct(structInfos);

  const anonymisedStructure = new StructureModel(structure).anonymise();

  const response = await fetch(`${config.API_ANALYTICS_ENDPOINT}/log/structure`, {
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
      evenement_type: "structure",
      evenement_valeur: value || "",
      structure_id: patch.ref.toString(),
      structure_statut: structure.status || actualStructure.status,
      stucture_statusLegal: structure.legalStatus || actualStructure.legalStatus,
      structure_type: actualStructure?.types || [],
      structure_sousType: structure.sousType || actualStructure.sousType,
      structure_nom: structure.name || actualStructure.name,
      structure_departement: structure.department || actualStructure.department,
      structure_region: structure.region || actualStructure.region,
      structure_preparationMilitaire: structure.isMilitaryPreparation || actualStructure.isMilitaryPreparation,
      structure_reseau: structure.isNetwork,
      date: patch.date,
      raw_data: anonymisedStructure,
    }),
  });

  const successResponse = checkResponseStatus(response);
  return successResponse.json();
}

const rebuildStruct = (structInfos) => {
  let structure = {};
  for (const structInfo of structInfos) {
    for (const op of structInfo.ops) {
      let operation = op.path.split("/")[1];
      structure[operation] = op.value;
    }
  }
  return structure;
};

exports.handler = async () => {
  try {
    token = await getAccessToken(config.API_ANALYTICS_ENDPOINT, config.API_ANALYTICS_API_KEY);

    await findAll(StructurePatchModel, mongooseFilterForDayBefore(), processPatch);
    await slack.info({
      title: "✅ Structure Logs",
      text: `${result.structurePatchScanned} structure patches were scanned:\n ${printResult(result.event)}`,
    });
  } catch (e) {
    slack.error({ title: "❌ Structure Logs", text: e });
    capture(e);
    throw e;
  }
};

// Script de rattrapage manuel
// commande terminal : node -e "require('./structure').manualHandler('2023-08-17', '2023-08-18')"
exports.manualHandler = async (startDate, endDate) => {
  try {
    token = await getAccessToken(config.API_ANALYTICS_ENDPOINT, config.API_ANALYTICS_API_KEY);

    await findAll(StructurePatchModel, { date: { $gte: new Date(startDate), $lt: new Date(endDate) } }, processPatch);

    console.log(result);
  } catch (e) {
    console.log(e);
  }
};
