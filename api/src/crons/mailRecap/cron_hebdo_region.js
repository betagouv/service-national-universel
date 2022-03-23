const fs = require("fs");
const path = require("path");

require("../../mongo");
const { sendEmail } = require("../../sendinblue");
const ReferentModel = require("../../models/referent");
const { regionList, getDataInscriptions, getDataStructure, sanitizeAll } = require("../utils");
const { capture } = require("../../sentry");
const { ROLES } = require("snu-lib/roles");

const arr = regionList;

async function sendRecapRegion() {
  const htmlContentDefault = fs.readFileSync(path.resolve(__dirname, "../../templates/recap/region.html")).toString();
  const subject = "Synthèse des inscriptions 2021";
  let count = 0;
  for (let i = 0; i < arr.length; i++) {
    const region = arr[i];
    console.log("> start region :", region);
    const referents = await ReferentModel.find({ role: ROLES.REFERENT_REGION, region });
    if (referents && referents.length) {
      console.log(referents.length, "referent(s) found");
      const dataInscriptions = await getDataInscriptions({ region });
      console.log(dataInscriptions);
      const dataStructure = await getDataStructure({ region });
      console.log(dataStructure);

      for (let j = 0; j < referents.length; j++) {
        const ref = referents[j];
        let htmlContent = htmlContentDefault;
        let toName = `${ref.firstName} ${ref.lastName}`;
        let email = ref.email;
        htmlContent = htmlContent.replace(/{{cta}}/g, sanitizeAll("https://admin.snu.gouv.fr"));
        htmlContent = htmlContent.replace(/{{toName}}/g, sanitizeAll(toName));
        htmlContent = htmlContent.replace(/{{region}}/g, sanitizeAll(region));
        htmlContent = htmlContent.replace(/{{new_inscription_waiting_validation}}/g, sanitizeAll(dataInscriptions.new_inscription_waiting_validation));
        htmlContent = htmlContent.replace(/{{new_inscription_validated}}/g, sanitizeAll(dataInscriptions.new_inscription_validated));
        htmlContent = htmlContent.replace(/{{new_structure}}/g, sanitizeAll(dataStructure.new_structure));
        htmlContent = htmlContent.replace(/{{inscription_waiting_validation}}/g, sanitizeAll(dataInscriptions.inscription_waiting_validation));
        htmlContent = htmlContent.replace(/{{inscription_validated}}/g, sanitizeAll(dataInscriptions.inscription_validated));
        await sendEmail({ name: toName, email }, subject, htmlContent);
        count++;
        console.log("recap hebdo", region, "sent to :", email);
      }
    }
  }
  capture(`RECAP REGION SENT : ${count} mails`);
}

module.exports = {
  sendRecapRegion,
};
