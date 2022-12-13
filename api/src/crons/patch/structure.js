require("../../mongo");

const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const fetch = require("node-fetch");

const { capture } = require("../../sentry");
const slack = require("../../slack");
const StructureModel = require("../../models/structure");
const { API_ANALYTICS_ENDPOINT, API_ANALYTICS_API_KEY } = require("../../config.js");
const { mongooseFilterForDayBefore, checkResponseStatus, getAccessToken, findAll, printResult } = require("./utils");

let token;
const result = { event: {} };

async function processPatch(patch, count, total) {
  try {
    result.structurePatchScanned = result.structurePatchScanned + 1 || 1;
    // if (count % 100 === 0) console.log(count, "/", total);
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
    capture(`Couldn't create structure log for patch id : ${patch._id}`, JSON.stringify(e));
    throw e;
  }
}

async function createLog(patch, actualStructure, event, value) {
  const structInfos = await actualStructure.patches.find({ ref: ObjectId(patch.ref.toString()), date: { $lte: patch.date } }).sort({ date: 1 });
  let structure = rebuildStruct(structInfos);

  // console.log(
  //   (Array.isArray(structure?.types) ? structure?.types[0] : structure?.types) || (Array.isArray(actualStructure?.types) ? actualStructure?.types[0] : actualStructure?.types),
  // );

  const response = await fetch(`${API_ANALYTICS_ENDPOINT}/log/structure`, {
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
      raw_data: structure,
    }),
  });

  const successResponse = checkResponseStatus(response);
  return await successResponse.json();
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
    token = await getAccessToken(API_ANALYTICS_ENDPOINT, API_ANALYTICS_API_KEY);

    const structure_patches = mongoose.model("structure_patches", new mongoose.Schema({}, { collection: "structure_patches" }));
    await findAll(structure_patches, mongooseFilterForDayBefore(), processPatch);
    await slack.info({
      title: "✅ Structure Logs",
      text: `${result.structurePatchScanned} structure patches were scanned:\n ${printResult(result.event)}`,
    });
    process.exit();
  } catch (e) {
    capture("Error during creation of young structure logs", e);
    slack.error({ title: "❌ Structure Logs", text: e });
  }
};
