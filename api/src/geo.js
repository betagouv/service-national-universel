const fetch = require("node-fetch");
const querystring = require("querystring");
const { capture } = require("./sentry");
const { QPV_USERNAME, QPV_PASSWORD } = require("./config");
const AreaModel = require("./models/areas");

const url = "https://wsa.sig.ville.gouv.fr/service/georeferenceur.json";
// ZUS : Zone Urbain Sensible /
// ZFU : Zones Franches Urbaines
// HZUS : ???
// QP : QUartier Prioritaire

async function getQPV(postcode, commune, adresse) {
  try {
    if (!QPV_USERNAME || !QPV_PASSWORD) return console.log("QPV ENV VARIABLES ARE NOT SET (QPV_USERNAME and QPV_PASSWORD) ");

    // I need to remove postcode and city from the adresse
    let addresseFormated = adresse.replace(postcode, "").replace(commune, "");

    return new Promise((resolve, reject) => {
      const obj = {
        type_quartier: "QP",
        type_adresse: "MIXTE",
        "adresse[code_postal]": postcode,
        "adresse[nom_commune]": commune,
        "adresse[nom_voie]": addresseFormated,
      };

      const str = querystring.stringify(obj);

      fetch(url + "?" + str, {
        method: "get",
        retries: 3,
        retryDelay: 1000,
        retryOn: [502, 503, 504],
        headers: { "Content-Type": "application/json", Authorization: "Basic " + Buffer.from(QPV_USERNAME + ":" + QPV_PASSWORD).toString("base64") },
      })
        .then((res) => {
          if (res.status !== 200) {
            capture(res);
            throw new Error("Request failed with status " + res.status);
          }
          return res.json();
        })
        .then(({ code_reponse }) => {
          if (!code_reponse) {
            return resolve(null);
          }
          if (code_reponse === "OUI") return resolve(true);
          if (code_reponse === "NON") return resolve(false);
          return resolve(null);
        })
        .catch((err) => {
          reject(err);
        });
    });
  } catch (e) {
    capture(e);
  }
}

async function getDensity(cityCode) {
  try {
    if (!cityCode) {
      console.log("City Code is not set");
      return "";
    }
    const area = await AreaModel.findOne({ cityCode });
    if (!area) {
      console.log(`cityCode not found ${cityCode}`);
      return "";
    }
    return area.density;
  } catch (e) {
    capture(e);
  }
}

module.exports = { getQPV, getDensity };
