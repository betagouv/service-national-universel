const crypto = require("crypto");
const fs = require("fs");
const csv = require("csv-parser");

require("dotenv").config({ path: "./../.env-prod" });
require("../src/mongo");

const YoungModel = require("../src/models/young");

(async () => {
  const arr = await parse("./SNU_-_NC_2020-2.csv");
  let count = 0;
  for (let i = 0; i < arr.length; i++) {
    try {
      const youngFile = arr[i];
      console.log(youngFile);
      // await YoungModel.deleteOne({ email: youngFile.email });
      await YoungModel.create(youngFile);
    } catch (e) {
      console.log("e", e);
    }
    count++;
    console.log({ count });
    // console.log(`${parseInt((count * 100) / arr.length)} %`);
  }
  process.exit(1);
})();

function parse(file) {
  let arr = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream(file)
      .pipe(csv())
      .on("data", async (row) => {
        let newRow = {};
        try {
          const obj = {};

          Object.keys(row).map((key) => {
            newRow[key.trim()] = row[key]; // fix weird bug with the key REGION
          });
          obj.lastName = newRow["NOM"];
          obj.firstName = newRow["PRENOM"];
          const date = newRow["DATE NAISS."];
          const [d, m, y] = date.split("/");
          obj.birthdateAt = date && `${m}/${d}/${y}`;
          obj.gender = newRow["SEXE"] === "F" ? "female" : "male";
          const mail = newRow["mél parents ou responsables"] || `${newRow["Ordre"]}@unknown.snu`;
          obj.email = mail.trim().toLowerCase();
          obj.frenchNationality = "true";

          obj.schoolName = newRow["Nom de l'établissement"];

          obj.address = newRow["ADRESSE"];
          const zip = obj.address && obj.address.match(/\d{5}/);
          obj.zip = zip && zip.length && zip[0];
          obj.city = newRow["COMMUNE"];

          obj.schoolName = newRow["ETABLISSEMENT 2020"];

          obj.department = "Nouvelle-Calédonie";
          obj.region = "Nouvelle-Calédonie";

          obj.cohort = "2020";
          obj.cohesionStayPresence = "true";
          obj.cohesionStayMedicalFileReceived = "true";
          obj.phase = "INTEREST_MISSION";
          obj.status = "VALIDATED"; // inscription validée puisque déja dans le snu
          obj.statusPhase1 = "DONE";
          obj.statusPhase2 = "WAITING_REALISATION";

          arr.push(obj);
        } catch (e) {
          console.log("e", e);
        }
      })
      .on("end", async () => {
        resolve(arr);
      });
  });
}
