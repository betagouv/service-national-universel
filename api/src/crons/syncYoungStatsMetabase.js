require("dotenv").config({ path: "./../../.env-staging" });
require("../mongo");
const { capture } = require("../sentry");
const slack = require("../slack");
const Center = require("../models/cohesionCenter");
const Session = require("../models/sessionPhase1");
const Young = require("../models/young");
const YoungStats = require("../models/stats-young-center");

const whiteListYoung = [
  "firstName",
  "lastName",
  "email",
  "cohort",
  "phase",
  "status",
  "statusPhase1",
  "statusPhase2",
  "statusPhase3",
  "acceptCGU",
  "cohesionStayPreference",
  "cohesionStayMedicalFileReceived",
  "highSkilledActivity",
  "highSkilledActivityInSameDepartment",
  "specificAmenagment",
  "allergies",
  "handicapInSameDepartment",
  "handicap",
  "reducedMobilityAccess",
  "ppsBeneficiary",
  "paiBeneficiary",
  "medicosocialStructure",
  "parentConsentment",
  "young_consentment",
  "imageRight",
  "autoTestPCR",
  "rulesYoung",
  "mobilityTransport",
  "_id",
  "birthdateAt",
  "lastStatusAt",
  "lastLoginAt",
  "createdAt",
  "updatedAt",
  "birthCity",
  "birthCountry",
  "address",
  "addressVerified",
  "city",
  "zip",
  "cityCode",
  "complementAddress",
  "country",
  "department",
  "region",
  "populationDensity",
  "foreignAddress",
  "foreignCity",
  "foreignZip",
  "foreignCountry",
  "hostAddress",
  "hostCity",
  "hostZip",
  "hostDepartment",
  "hostRegion",
  "gender",
  "qpv",
  "academy",
  "schoolCountry",
  "schooled",
  "employed",
  "schoolName",
  "schoolCountry",
  "schoolRegion",
  "schoolDepartment",
  "schoolZip",
  "schoolType",
  "schoolCertification",
  "grade",
  "situation",
  "jdc",
  "deplacementPhase1Autonomous",
  "meetingPointId",
  "sessionPhase1Id",
  "sessionPhase1IdTmp",
  "codeCenterTmp",
  "busTmp",
];
const whiteListCenter = [
  "name",
  "code",
  "_id",
  "code2022",
  "country",
  "COR",
  "address",
  "city",
  "zip",
  "department",
  "region",
  "placesTotal",
  "placesLeft",
  "outfitDelivered",
  "observations",
  "waitingList",
  "pmr",
  "cohorts",
  "createdAt",
  "updatedAt",
];

exports.handler = async () => {
  try {
    const cursor = await Young.find({ sessionPhase1Id: { $ne: null } }).cursor();
    await cursor.eachAsync(async function (young) {
      let obj = {};
      const session = await Session.findById(young.sessionPhase1Id);
      if (!session) return console.log("NO SESSION 🌧️", young._id);
      const center = await Center.findById(session.cohesionCenterId);
      if (!center) return console.log("NO CENTER 😢", session._id);

      // Young entries 🧒

      // on récupère un array d'objet et ce qui nous intéresse se situe dans doc
      // celui-ci se trouve 5è position.
      const youngObject = Object.entries(young)[5];
      // une fois la partie doc récupérée, on se retrouve avec un array composé littéralement de "doc" et ensuite l'objet young.
      Object.keys(youngObject[1]).forEach((key) => {
        if (whiteListYoung.includes(key)) {
          obj[`young_${key}`] = young[key];
        }
      });
      // Center entries 🏛️
      const centerObject = Object.entries(center)[5];
      Object.keys(centerObject[1]).forEach((key) => {
        if (whiteListCenter.includes(key)) {
          obj[`center_${key}`] = center[key];
        }
      });

      // Session cohort 📆
      obj["young_sessionCohort"] = session.cohort;

      // Creating or updating stats 📈
      const existingYCStats = await YoungStats.findOne({ young__id: obj["young__id"] });
      if (existingYCStats) {
        existingYCStats.set(obj);
        existingYCStats.save();
        console.log("UPDATE STATS ⬆️");
      } else {
        await YoungStats.create(obj);
        console.log("CREATED STATS ✨");
      }
    });
  } catch (e) {
    capture(`ERROR`, JSON.stringify(e));
    capture(e);
    slack.error({ title: "Stats youngs + center Metabase", text: JSON.stringify(e) });
    console.log("ERROR 🚫", e);
  }
};
