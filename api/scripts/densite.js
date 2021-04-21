const fetch = require("node-fetch");

require("dotenv").config({ path: "../.env-prod" });

require("../src/mongo");
const YoungModel = require("../src/models/young");

const fs = require("fs");
const csv = require("csv-parser");

(async () => {
  const obj = await parse();
  const arr = [];
  let count = 0;
  const cursor = YoungModel.find({}).cursor();
  await cursor.eachAsync(async function (doc) {
    if (count++ % 100 === 0) console.log(count);
    arr.push(doc);
  });

  for (let i = 0; i < arr.length; i++) {
    const doc = arr[i];
    if (i % 10 === 0) console.log(i);
    try {
      if (!doc.address) continue;
      if (doc.populationDensity) continue;
      if (doc.cityCode) continue;

      let yo;

      if (doc.city === "Paris") {
        yo = { populationDensity: "DENSE", cityCode: "75056" };
      } else {
        const r = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURI(doc.address)}`).then((res) => res.json());
        const cityCode = r.features[0].properties.citycode;
        yo = { populationDensity: obj[cityCode], cityCode: cityCode };
      }
      console.log("yo", yo);
      doc.set(yo);
      await doc.save();
    } catch (e) {
      console.log("e", e);
    }
  }
})();

async function parse() {
  const obj = {};
  return new Promise((resolve, reject) => {
    fs.createReadStream("./densite.csv")
      .pipe(csv())
      .on("data", async (row) => {
        try {
          let populationDensity;
          if (row["Typo degré de Densité"] === "4") populationDensity = "TRES PEU DENSE";
          if (row["Typo degré de Densité"] === "3") populationDensity = "PEU DENSE";
          if (row["Typo degré de Densité"] === "2") populationDensity = "INTERMEDIAIRE";
          if (row["Typo degré de Densité"] === "1") populationDensity = "DENSE";
          obj[row["Code Commune"]] = populationDensity;
        } catch (e) {
          console.log("e", e);
        }
      })
      .on("end", async () => {
        resolve(obj);
      });
  });
}
