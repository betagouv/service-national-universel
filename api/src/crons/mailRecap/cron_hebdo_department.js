const fs = require("fs");
const path = require("path");

require("../../mongo");
const { sendEmail } = require("../../sendinblue");
const ReferentModel = require("../../models/referent");
const { departmentList, getDataInscriptions, getDataStructure } = require("../utils");
const { capture } = require("../../sentry");
const { ROLES } = require("snu-lib");

const arr = departmentList;

async function sendRecapDepartmentTuesday() {
  const htmlContentDefault = fs.readFileSync(path.resolve(__dirname, "../../templates/recap/department.html")).toString();
  const subject = "Synthèse des inscriptions 2021";
  let count = 0;

  for (let i = 0; i < arr.length; i++) {
    const department = arr[i];
    console.log("> start department :", department);
    const referents = await ReferentModel.find({ role: ROLES.REFERENT_DEPARTMENT, department });
    if (!(referents && referents.length)) continue;
    console.log(referents.length, "referent(s) found");
    const dataInscriptions = await getDataInscriptions({ department, days: 5 });
    console.log(dataInscriptions);
    const dataStructure = await getDataStructure({ department, days: 5 });
    console.log(dataStructure);

    for (let j = 0; j < referents.length; j++) {
      const ref = referents[j];
      let toName = `${ref.firstName} ${ref.lastName}`;
      let email = ref.email;
      const htmlContent = htmlContentDefault
        .replace(/{{sectionTitle}}/g, "Depuis jeudi dernier, il y a...")
        .replace(/{{cta}}/g, "https://admin.snu.gouv.fr")
        .replace(/{{toName}}/g, toName)
        .replace(/{{department}}/g, department)
        .replace(/{{new_inscription_waiting_validation}}/g, dataInscriptions.new_inscription_waiting_validation)
        .replace(/{{new_inscription_validated}}/g, dataInscriptions.new_inscription_validated)
        .replace(/{{new_structure}}/g, dataStructure.new_structure)
        .replace(/{{inscription_waiting_validation}}/g, dataInscriptions.inscription_waiting_validation)
        .replace(/{{inscription_validated}}/g, dataInscriptions.inscription_validated);
      await sendEmail({ name: toName, email: email }, subject, htmlContent);
      count++;
      console.log("recap hebdo", department, "sent to :", email);
    }
  }
  capture(`RECAP DEPARTEMENT SENT : ${count} mails`);
}

async function sendRecapDepartmentThursday() {
  const htmlContentDefault = fs.readFileSync(path.resolve(__dirname, "../../templates/recap/department.html")).toString();
  const subject = "Synthèse des inscriptions 2021";
  let count = 0;
  for (let i = 0; i < arr.length; i++) {
    const department = arr[i];
    console.log("> start department :", department);
    const referents = await ReferentModel.find({ role: ROLES.REFERENT_DEPARTMENT, department });
    if (!(referents && referents.length)) continue;
    console.log(referents.length, "referent(s) found");
    const dataInscriptions = await getDataInscriptions({ department, days: 2 });
    console.log(dataInscriptions);
    const dataStructure = await getDataStructure({ department, days: 2 });
    console.log(dataStructure);

    for (let j = 0; j < referents.length; j++) {
      const ref = referents[j];
      let toName = `${ref.firstName} ${ref.lastName}`;
      let email = ref.email;
      const htmlContent = htmlContentDefault
        .replace(/{{sectionTitle}}/g, "Depuis mardi, il y a...")
        .replace(/{{cta}}/g, "https://admin.snu.gouv.fr")
        .replace(/{{toName}}/g, toName)
        .replace(/{{department}}/g, department)
        .replace(/{{new_inscription_waiting_validation}}/g, dataInscriptions.new_inscription_waiting_validation)
        .replace(/{{new_inscription_validated}}/g, dataInscriptions.new_inscription_validated)
        .replace(/{{new_structure}}/g, dataStructure.new_structure)
        .replace(/{{inscription_waiting_validation}}/g, dataInscriptions.inscription_waiting_validation)
        .replace(/{{inscription_validated}}/g, dataInscriptions.inscription_validated);
      await sendEmail({ name: toName, email }, subject, htmlContent);
      count++;
      console.log("recap hebdo", department, "sent to :", email);
    }
  }
  capture(`RECAP DEPARTEMENT SENT : ${count} mails`);
}

module.exports = {
  sendRecapDepartmentTuesday,
  sendRecapDepartmentThursday,
};
