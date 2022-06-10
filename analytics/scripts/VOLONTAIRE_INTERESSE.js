require("dotenv").config({ path: "../.env" });
const { MongoClient, ObjectId } = require("mongodb");
const { MONGO_URL, MONGO_NAME } = require("../src/config");
const { db } = require("../src/postgresql");
const LogModel = require("../src/models/log");

const client = new MongoClient(MONGO_URL);

(async () => {
  try {
    await client.connect();
    console.log("Connected correctly to mongoDB");
    const mongo = client.db(MONGO_NAME);
    const patchsModel = mongo.collection("young_patches");
    const youngModel = mongo.collection("youngs");
    const cursor = patchsModel.find();

    let countTotal = 0;
    let countCreated = 0;
    let countValidated = 0;
    let statusPhase1 = 0;
    let cohesionStayPresence = 0;
    let migValidated = 0;

    while ((patch = await cursor.next())) {
      countTotal++;
      if (countTotal % 100 === 0) console.log(countTotal);
      try {
        if (patch.ops.length > 0) {
          for (const op of patch.ops) {
            let operation = op.path.split("/")[1];

            //Volontaire interressé
            if (operation === "createdAt") {
              await createLog(patch, patchsModel, youngModel, "VOLONTAIRE_INTERESSE");
              countCreated++;
            }
            //Volontaire inscrit
            if (operation === "status" && op.value === "VALIDATED") {
              await createLog(patch, patchsModel, youngModel, "VOLONTAIRE_INTERESSE");
              countValidated++;
            }
            //SEJOUR_TERMINE
            if (operation === "statusPhase1" && op.value === "DONE") {
              await createLog(patch, patchsModel, youngModel, "SEJOUR_TERMINE");
              statusPhase1++;
            }
            //Presence sejour
            if (operation === "cohesionStayPresence" && op.value === "true") {
              await createLog(patch, patchsModel, youngModel, "SEJOUR_PRESENCE");
              cohesionStayPresence++;
            }
            //MIG valide
            if (operation === "statusPhase2" && op.value === "VALIDATED") {
              await createLog(patch, patchsModel, youngModel, "STATUS_VALIDE");
              migValidated++;
            }
          }
        }
      } catch (e) {
        console.log("CATCH", e);
      }
    }
    console.log({ countTotal, countCreated, countValidated, statusPhase1, cohesionStayPresence, migValidated });
  } catch (e) {
    console.log("CATCH", e);
  } finally {
    await client.close();
    await db.close();
  }
})();

async function createLog(patch, patchsModel, youngModel, event) {
  console.log(`✅ Create new log for event ${event} with patch id :`, patch._id.toString());

  const actualYoung = await youngModel.findOne({ _id: ObjectId(patch.ref.toString()) });

  const youngInfos = await patchsModel
    .find({ ref: ObjectId(patch.ref.toString()), date: { $lte: patch.date } })
    .sort({ date: 1 })
    .toArray();

  let young = {};
  for (const youngInfo of youngInfos) {
    for (const op of youngInfo.ops) {
      let operation = op.path.split("/")[1];

      if (["gender", "birthdateAt", "grade", "situation", "handicap", "qpv", "department", "region", "cohorte"].includes(operation)) {
        console.log(operation, op.value);
      }

      switch (operation) {
        case "gender":
          young.gender = op.value;
          break;
        case "birthdateAt":
          young.birthdateAt = op.value;
          break;
        case "grade":
          young.grade = op.value;
          break;
        case "situation":
          young.situation = op.value;
          break;
        case "handicap":
          young.handicap = op.value;
          break;
        case "qpv":
          young.qpv = op.value;
          break;
        case "department":
          young.department = op.value;
          break;
        case "region":
          young.region = op.value;
          break;
        case "cohorte":
          young.cohort = op.value;
          break;
      }
    }
  }

  const log = await LogModel.create({
    evenement_nom: event,
    evenement_type: "young",
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
    date: new Date(patch.date),
  });
  console.log("log's auto-generated ID:", log.id);
}
