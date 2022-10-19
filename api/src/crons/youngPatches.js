require("../mongo");

const { ObjectId } = require("mongodb");
const fetch = require("node-fetch");
const mongoose = require("mongoose");
const { isInRuralArea, getAge } = require("snu-lib");

const { capture } = require("../sentry");
const YoungModel = require("../models/young");
const { API_ANALYTICS_ENDPOINT, API_ANALYTICS_API_KEY } = require("../config.js");
const { getDateString, getMinusDate } = require("./utils");

async function process(patch, count, total) {
  try {
    if (count % 100 === 0) console.log(count, "/", total);
    // console.log("🎉 patch id :", patch._id.toString());

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
          await createLog(patch, actualYoung, eventName, op.value);
        }
      }
    }
  } catch (e) {
    console.log(`Couldn't create patch for patch id : ${patch._id}`, e);
  }
}

async function createLog(patch, actualYoung, event, value) {
  // console.log(`✅ Create new log for event ${event} with patch id :`, patch._id.toString());
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
      "x-api-key": API_ANALYTICS_API_KEY,
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
  })
    .then((response) => response.json())
    .catch((error) => console.log("error fetch struture :", error));

  // console.log("log's auto-generated ID:", response.data.id);
}

const rebuildYoung = (youngInfos) => {
  let young = {};
  for (const youngInfo of youngInfos) {
    for (const op of youngInfo.ops) {
      let operation = op.path.split("/")[1];
      young[operation] = op.value;
    }
  }
  //console.log("✅ young rebuilt :", young);
  return young;
};

async function findAll(Model, where, cb) {
  let count = 0;
  //let process = true;
  const total = await Model.countDocuments(where);
  await Model.find(where)
    .cursor()
    .addCursorFlag("noCursorTimeout", true)
    .eachAsync(async (doc) => {
      try {
        count++;
        //if (doc._doc._id.toString() === "625a947f8aa1df07eaaeb159") process = true;
        //) {
        await cb(doc._doc, count, total);
        //}
      } catch (e) {
        throw e;
        // console.log("e", e);
      }
    });
}

exports.handler = async () => {
  try {
    const todayDateString = getDateString(new Date());
    const yesterdayDateString = getDateString(getMinusDate(1));

    const young_patches = mongoose.model("young_patches", new mongoose.Schema({}, { collection: "young_patches" }));

    await findAll(young_patches, { date: { $gte: new Date(yesterdayDateString), $lt: new Date(todayDateString) } }, process);

    process.exit(0);
  } catch (e) {
    capture("Error during creation of young patch logs", JSON.stringify(e));
  }
};
