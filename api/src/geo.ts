import fetch from "node-fetch";
import querystring from "querystring";
import { capture, captureMessage } from "./sentry";
import config from "config";
import { logger } from "./logger";
import { AreasModel } from "./models";

type GeoReferenceurResponse = {
  code_reponse?: string;
};

const url = "https://wsa.sig.ville.gouv.fr/service/georeferenceur.json";
// ZUS : Zone Urbain Sensible /
// ZFU : Zones Franches Urbaines
// HZUS : ???
// QP : QUartier Prioritaire

export async function getQPV(postcode: string, commune: string, adresse: string): Promise<unknown> {
  try {
    if (!config.QPV_USERNAME || !config.QPV_PASSWORD) {
      captureMessage("QPV ENV VARIABLES ARE NOT SET (QPV_USERNAME and QPV_PASSWORD) ");
      return;
    }

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
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic " + Buffer.from(config.QPV_USERNAME + ":" + config.QPV_PASSWORD).toString("base64"),
        },
      })
        .then((res) => {
          if (res.status !== 200) {
            capture(res);
            throw new Error("Request failed with status " + res.status);
          }
          return res.json();
        })
        .then(({ code_reponse }: GeoReferenceurResponse = {}) => {
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

export async function getDensity(cityCode: string): Promise<string | undefined> {
  try {
    if (!cityCode) {
      logger.warn("City Code is not set");
      return "";
    }
    const area = await AreasModel.findOne({ cityCode });
    if (!area) {
      logger.warn(`cityCode not found ${cityCode}`);
      return "";
    }
    return area.density;
  } catch (e) {
    capture(e);
  }
}
