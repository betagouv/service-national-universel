const fetch = require("node-fetch");
const querystring = require("querystring");
const { capture } = require("./sentry");
const { QPV_USERNAME, QPV_PASSWORD } = require("./config");

const url = "https://wsa.sig.ville.gouv.fr/service/georeferenceur.json";

// ZUS : Zone Urbain Sensible /
// ZFU : Zones Franches Urbaines
// HZUS : ???
// QP : QUartier Prioritaire

async function getQPV(postcode, commune, adresse) {
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
      headers: { "Content-Type": "application/json", Authorization: "Basic " + Buffer.from(QPV_USERNAME + ":" + QPV_PASSWORD).toString("base64") },
    })
      .then((res) => {
        if (res.status !== 200) {
          capture(res);
          return reject();
        }
        return res.json();
      })
      .then((json) => {
        if (!json.reponses) {
          // capture(`Cant find ${postcode}, ${commune}, ${addresseFormated}`);
          return resolve(false);
        }
        if (json.reponses.length && json.reponses[0].code_reponse === "OUI") return resolve(true);
        return resolve(false);
      });
  });
}

module.exports = { getQPV };
