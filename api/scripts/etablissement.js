require("dotenv").config({ path: "./../.env-prod" });
require("../src/mongo");

const SchoolModel = require("../src/models/school");

const fs = require("fs");
const csv = require("csv-parser");

(async () => {
  const arr = await parse();
  let count = 0;
  for (let i = 0; i < arr.length; i++) {
    try {
      const school = await SchoolModel.findOneAndUpdate({ postcode: arr[i].postcode, name2: arr[i].name2 }, arr[i], { upsert: true, new: true });
      await school.index();
    } catch (e) {
      console.log("e", e);
    }

    console.log(count++);
  }

  console.log("aa", arr.length);
})();

function parse() {
  let arr = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream("./etablissement.csv")
      .pipe(csv())
      .on("data", async (row) => {
        try {
          const obj = {};
          obj.postcode = row["code_postal_UAI"];
          obj.department = row["departement"];
          obj.name1 = row["dénomination_principale"];
          obj.name2 = row["Dénomination_complémentaire"];
          obj.city = row["localité_acheminement"];
          obj.type = row["nature libellé"];
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

/*

  numero_UAI: '0623209B',
  'dénomination_principale': 'CENTRE EDUCATIF FERME',
  'Dénomination_complémentaire': 'BRUAY LA BUISSIERE',
  code_postal_UAI: '62700',
  'localité_acheminement': 'BRUAY LA BUISSIERE',
  departement: '062',
  nature_uai: '271',
  libelle_court: 'C.A.E.',
  'nature libellé': 'CENTRE D ACTION EDUCATIVE',
  'Ministère tutelle ': 'JUSTICE',
  UAIDTO: '1-Oct-72',
  ACADCO: '09'
  */
