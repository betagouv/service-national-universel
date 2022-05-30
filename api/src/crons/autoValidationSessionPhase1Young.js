require("dotenv").config({ path: "./../../.env-staging" });
require("../mongo");
const YoungModel = require("../models/young");
const SessionPhase1Model = require("../models/sessionPhase1");
const { capture } = require("../sentry");
const slack = require("../slack");

const dateDeValidation = {
  "Juin 2022": new Date(2022, 5, 20, 18), //20 juin 2022 à 18h
  "Juillet 2022": new Date(2022, 6, 11, 18), //11 juillet 2022 à 18h
};

const dateDeValidationTerminale = {
  "Juin 2022": new Date(2022, 5, 22, 18), //22 juin 2022 à 18h
  "Juillet 2022": new Date(2022, 6, 13, 18), //13 juillet 2022 à 18h
};

const process = async () => {
  let countTotal = 0;
  let youngTotal = 0;
  let noPresenceJDM = 0;
  let excludedBefore = 0;
  let excludedAfter = 0;
  let doneBefore = 0;
  let doneAfter = 0;
  const now = new Date();

  const cursor = SessionPhase1Model.find({ cohort: ["Juin 2022", "Juillet 2022"] })
    .sort({ cohort: 1 })
    .cursor();

  await cursor.eachAsync(async function (sessionPhase1) {
    countTotal++;
    try {
      const youngs = await YoungModel.find({ sessionPhase1Id: sessionPhase1._id });
      if (youngs.length) {
        youngTotal += youngs.length;
        for (const young of youngs) {
          console.log(young.presenceJDM, young.departSejourMotif, young.grade, young.cohort);
          if (young.cohesionStayPresence === "true" && (young.presenceJDM === "true" || young.grade === "Terminale")) {
            if (
              (now > dateDeValidation[sessionPhase1.cohort] && young?.grade !== "Terminale" && young.departSejourAt > dateDeValidation[sessionPhase1.cohort]) ||
              (now > dateDeValidationTerminale[sessionPhase1.cohort] && young?.grade === "Terminale" && young.departSejourAt > dateDeValidationTerminale[sessionPhase1.cohort])
            ) {
              if (young?.departSejourMotif && ["Exclusion"].includes(young.departSejourMotif)) {
                young.set({ statusPhase1: "NOT_DONE" });
                excludedAfter++;
              } else {
                young.set({ statusPhase1: "DONE" });
                doneAfter++;
              }
            } else {
              if (young?.departSejourMotif && ["Exclusion", "Autre"].includes(young.departSejourMotif)) {
                young.set({ statusPhase1: "NOT_DONE" });
                excludedBefore++;
              } else if (
                young?.departSejourMotif &&
                ["Cas de force majeure pour le volontaire", "Annulation du séjour ou mesure d’éviction sanitaire"].includes(young.departSejourMotif)
              ) {
                young.set({ statusPhase1: "DONE" });
                doneBefore++;
              }
            }
          } else {
            //pas sur peut etre ne r faire
            young.set({ statusPhase1: "NOT_DONE" });
            noPresenceJDM++;
          }
        }
      }
    } catch (e) {
      capture(`ERROR auto update statut phase1`, JSON.stringify(e));
    }
  });
  await slack.success({ title: "auto update statut phase1" });
  console.log(`${countTotal} session scanned`);
  console.log(`${youngTotal} young scanned`);
  console.log(`${noPresenceJDM} no presence JDM`);
  console.log(`${excludedBefore} excluded before`);
  console.log(`${doneBefore} done before`);
  console.log(`${excludedAfter} excluded after`);
  console.log(`${doneAfter} done after`);
};

exports.handler = async () => {
  slack.info({ title: "auto update statut phase1", text: "I'm starting the update of young status phase 1" });
  try {
    process();
  } catch (e) {
    capture(`ERROR auto update statut phase1`, JSON.stringify(e));
    capture(e);
  }
};
