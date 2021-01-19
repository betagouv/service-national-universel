require("dotenv").config({ path: "../.env-staging" });

require("../src/mongo");
const YoungModel = require("../src/models/young");

const STEPS = {
  PROFIL: "PROFIL",
  COORDONNEES: "COORDONNEES",
  PARTICULIERES: "PARTICULIERES",
  REPRESENTANTS: "REPRESENTANTS",
  CONSENTEMENTS: "CONSENTEMENTS",
  MOTIVATIONS: "MOTIVATIONS",
  DONE: "DONE",
};

const clean = async (model) => {
  const cursor = model.find({ cohort: 2021 }).cursor();
  let countTotal = 0;
  let count = 0;
  await cursor.eachAsync(async function (doc) {
    countTotal++;
    try {
      // if the inscriptionStep value is different from the default value, we skip to the next one
      if (doc.inscriptionStep !== STEPS.COORDONNEES) return console.log("No need to check");

      const inscriptionStep = getStep(doc);

      // if the new inscriptionStep value is the same as the old one, we skip to the next one
      if (doc.inscriptionStep === inscriptionStep) return console.log("Same Value");

      // if it is a new one, different from the default one, we set it and save it
      count++;
      console.log(`${doc.email} is at step ${inscriptionStep}`);
      doc.set({ inscriptionStep });
      // await doc.save();
      // await doc.index();
    } catch (e) {
      console.log("e", e);
    }
  });
  console.log(`${countTotal} youngs scanned. ${count} has been modified.`);
};

const getStep = (young) => {
  if (hasEmptyField(young, ["cniFiles", "phone", "gender", "address", "city", "zip", "department", "region", "situation"])) return STEPS.COORDONNEES;
  if (hasEmptyField(young, ["handicap", "ppsBeneficiary", "paiBeneficiary", "highSkilledActivity"])) return STEPS.PARTICULIERES;
  if (hasEmptyField(young, ["parent1Status", "parent1FirstName", "parent1LastName", "parent1Phone", "parent1Email", "parent1OwnAddress"]))
    return STEPS.REPRESENTANTS;
  if (hasEmptyField(young, ["parentConsentment", "consentment", "parentConsentmentFiles"])) return STEPS.CONSENTEMENTS;
  return STEPS.DONE;
};

const hasEmptyField = (doc, fields) => {
  for (let i = 0; i < fields.length; i++) {
    let f = doc[fields[i]];
    if (!f || (Array.isArray(f) && f.length === 0)) return true;
  }
  return false;
};

(async function run() {
  console.log("CLEANING STEP INSCRIPTION");
  await clean(YoungModel);
  process.exit(1);
})();
