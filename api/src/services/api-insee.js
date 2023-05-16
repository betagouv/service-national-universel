const fetch = require("node-fetch");
const { capture } = require("../sentry");

// doc: https://www.observatoire-des-territoires.gouv.fr/outils/cartographie-interactive/#c=home
// @todo create en account to generate a consumer key and secret: https://www.insee.fr/fr/information/2028028

const url = "https://api.insee.fr";

// @todo use env variables

const consumerKey = "xxxxxxx";
const consumerSecret = "yyyyyyy";

// @todo find the right dataset, crossing, modality and geoLevel
const dataset = "RP2015"; // jeu_donnees
const crossing = "TF4"; // croisement
const modality = "all"; // modalite
const geoLevel = "COM"; // nivgeo

let accessToken = "null";

const getAccessToken = async () => {
  if (accessToken) return accessToken;
  try {
    const res = await fetch(`${url}/token`, {
      body: new URLSearchParams({
        grant_type: "client_credentials",
      }),
      headers: { Accept: "application/json", Authorization: `Basic ${Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64")}` },
      method: "POST",
    });
    const { access_token } = await res.json();
    accessToken = access_token;
    return access_token;
  } catch (e) {
    capture(e);
  }
};

const getArrondissement = async (cityCode) => {
  let retry = 0;
  const token = await getAccessToken();
  try {
    const res = await fetch(`${url}/donnees-locales/V0.1/donnees/geo-${crossing}@${dataset}/${geoLevel}-${cityCode}.${modality}`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const response = await res.json();
    if (response.fault && retry < 3) {
      accessToken = null;
      retry++;
      return getData(cityCode);
    }
    //@todo is it the data for the administrative disctric (arrondissement administratif)?
    const administratifDisctrict = response?.Zone?.Millesime?.Nccenr;
    if (!administratifDisctrict) {
      throw new Error(`no data for ${cityCode}`);
    }

    return administratifDisctrict;
  } catch (e) {
    capture(e);
  }
};

module.exports = { getArrondissement };
