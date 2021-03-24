const fs = require("fs");
const path = require("path");

require("../../mongo");
const { sendEmail } = require("../../sendinblue");
const ReferentModel = require("../../models/referent");
const { regionListTest, regionList, getDataInscriptions, getDataStructure } = require("../utils");

const arr = regionList;

async function sendRecapRegion() {
  const htmlContentDefault = fs.readFileSync(path.resolve(__dirname, "../../templates/recap/region.html")).toString();
  const subject = "Synthèse des inscriptions 2021";
  let count = 0;
  for (let i = 0; i < arr.length; i++) {
    const region = arr[i];
    console.log("> start region :", region);
    const referents = await ReferentModel.find({ role: "referent_region", region });
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
        let email = "tangi.mendes+reg@selego.co";
        htmlContent = htmlContent.replace(/{{cta}}/g, "https://admin.snu.gouv.fr");
        htmlContent = htmlContent.replace(/{{toName}}/g, toName);
        htmlContent = htmlContent.replace(/{{region}}/g, region);
        htmlContent = htmlContent.replace(/{{new_inscription_waiting_validation}}/g, dataInscriptions.new_inscription_waiting_validation);
        htmlContent = htmlContent.replace(/{{new_inscription_validated}}/g, dataInscriptions.new_inscription_validated);
        htmlContent = htmlContent.replace(/{{new_structure}}/g, dataStructure.new_structure);
        htmlContent = htmlContent.replace(/{{inscription_waiting_validation}}/g, dataInscriptions.inscription_waiting_validation);
        htmlContent = htmlContent.replace(/{{inscription_validated}}/g, dataInscriptions.inscription_validated);
        await sendEmail({ name: toName, email }, subject, htmlContent, { bcc: [{ email: "tangi.mendes@selego.co" }] });
        count++;
        console.log("recap hebdo", region, "sent to :", email);
      }
    }
  }
  console.log("DONE sendRecapRegion", count);
}

module.exports = {
  sendRecapRegion,
};
