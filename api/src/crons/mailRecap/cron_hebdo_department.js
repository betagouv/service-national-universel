const fs = require("fs");
const path = require("path");

require("../../mongo");
const { sendEmail } = require("../../sendinblue");
const ReferentModel = require("../../models/referent");
const { departmentListTest, departmentList, getDataInscriptions, getDataStructure } = require("../utils");

const arr = departmentList;

async function sendRecapDepartmentTuesday() {
  const htmlContentDefault = fs.readFileSync(path.resolve(__dirname, "../../templates/recap/department.html")).toString();
  const subject = "Synthèse des inscriptions 2021";
  for (let i = 0; i < arr.length; i++) {
    const department = arr[i];
    console.log("> start department :", department);
    const referents = await ReferentModel.find({ role: "referent_department", department });
    if (referents && referents.length) {
      console.log(referents.length, "referent(s) found");
      const dataInscriptions = await getDataInscriptions({ department, days: 5 });
      console.log(dataInscriptions);
      const dataStructure = await getDataStructure({ department, days: 5 });
      console.log(dataStructure);

      for (let j = 0; j < referents.length; j++) {
        const ref = referents[j];
        let htmlContent = htmlContentDefault;
        let toName = `${ref.firstName} ${ref.lastName}`;
        htmlContent = htmlContent.replace(/{{sectionTitle}}/g, "Depuis jeudi dernier, il ya eu...");
        htmlContent = htmlContent.replace(/{{cta}}/g, "https://admin.snu.gouv.fr");
        htmlContent = htmlContent.replace(/{{toName}}/g, toName);
        htmlContent = htmlContent.replace(/{{department}}/g, department);
        htmlContent = htmlContent.replace(/{{new_inscription_waiting_validation}}/g, dataInscriptions.new_inscription_waiting_validation);
        htmlContent = htmlContent.replace(/{{new_inscription_validated}}/g, dataInscriptions.new_inscription_validated);
        htmlContent = htmlContent.replace(/{{new_structure}}/g, dataStructure.new_structure);
        htmlContent = htmlContent.replace(/{{inscription_waiting_validation}}/g, dataInscriptions.inscription_waiting_validation);
        htmlContent = htmlContent.replace(/{{inscription_validated}}/g, dataInscriptions.inscription_validated);
        await sendEmail({ name: toName, email: `tangi.mendes+${department.replace(/\s+/, "-")}@selego.co` }, subject, htmlContent);
        console.log("recap hebdo", department, "sent to :", toName);
      }
    }
  }
  console.log("DONE.");
}

async function sendRecapDepartmentThursday() {
  const htmlContentDefault = fs.readFileSync(path.resolve(__dirname, "../../templates/recap/department.html")).toString();
  const subject = "Synthèse des inscriptions 2021";
  for (let i = 0; i < arr.length; i++) {
    const department = arr[i];
    console.log("> start department :", department);
    const referents = await ReferentModel.find({ role: "referent_department", department });
    if (referents && referents.length) {
      console.log(referents.length, "referent(s) found");
      const dataInscriptions = await getDataInscriptions({ department, days: 2 });
      console.log(dataInscriptions);
      const dataStructure = await getDataStructure({ department, days: 2 });
      console.log(dataStructure);

      for (let j = 0; j < referents.length; j++) {
        const ref = referents[j];
        let htmlContent = htmlContentDefault;
        let toName = `${ref.firstName} ${ref.lastName}`;
        htmlContent = htmlContent.replace(/{{sectionTitle}}/g, "Depuis mardi, il ya eu...");
        htmlContent = htmlContent.replace(/{{cta}}/g, "https://admin.snu.gouv.fr");
        htmlContent = htmlContent.replace(/{{toName}}/g, toName);
        htmlContent = htmlContent.replace(/{{department}}/g, department);
        htmlContent = htmlContent.replace(/{{new_inscription_waiting_validation}}/g, dataInscriptions.new_inscription_waiting_validation);
        htmlContent = htmlContent.replace(/{{new_inscription_validated}}/g, dataInscriptions.new_inscription_validated);
        htmlContent = htmlContent.replace(/{{new_structure}}/g, dataStructure.new_structure);
        htmlContent = htmlContent.replace(/{{inscription_waiting_validation}}/g, dataInscriptions.inscription_waiting_validation);
        htmlContent = htmlContent.replace(/{{inscription_validated}}/g, dataInscriptions.inscription_validated);
        await sendEmail({ name: toName, email: `tangi.mendes+${department.replace(/\s+/, "-")}@selego.co` }, subject, htmlContent);
        console.log("recap hebdo", department, "sent to :", toName);
      }
    }
  }
  console.log("DONE.");
}

module.exports = {
  sendRecapDepartmentTuesday,
  sendRecapDepartmentThursday,
};
