require("dotenv").config({ path: "./../.env-staging" });
require("../src/mongo");

// This file require a file that is not included to avoid privacy issues.
// See: https://trello.com/c/xh8CPRJQ/416-volontaire-affichage-mission

const YoungModel = require("../src/models/young");

const fs = require("fs");
const csv = require("csv-parser");

(async () => {
  const arr = await parse();
  let count = 0;
  for (let i = 0; i < arr.length; i++) {
    try {
      // const school = await SchoolModel.findOneAndUpdate({ postcode: arr[i].postcode, name2: arr[i].name2 }, arr[i], { upsert: true, new: true });
      // await school.index();
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
    // See: https://trello.com/c/xh8CPRJQ/416-volontaire-affichage-mission
    fs.createReadStream("/Users/raph/Downloads/demandes_snu.csv")
      .pipe(csv({ separator: ";" }))
      .on("data", async (row) => {
        try {
          // console.log(row);
          if (row["Statut"] === "Validé") {
            console.log(row["Email du volontaire"]);
            console.log("voilà");
            const y = await YoungModel.findOne({ email: row["Email du volontaire"] });
            console.log("voilà");
            console.log(y);
            console.log("voilà");
            process.exit(1);
          }
          process.exit(1);

          const obj = {};
          obj.email = row["'Email du volontaire'"];
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
