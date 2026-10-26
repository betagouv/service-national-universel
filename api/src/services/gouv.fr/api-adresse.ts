import qs from "qs";
import { capture } from "../../sentry";
import { logger } from "../../logger";

/**
 * API Adresse (BAN)
 * https://adresse.data.gouv.fr/api-doc/adresse
 *
 * TODO: Déplacer dans la snu-lib (en fusionnant avec l'implementation côté admin)
 */

export const apiAdress = async (
  queryString: string,
  filters: {
    postcode?: string;
    citycode?: string; // INSEE
    type?: "municipality" | "locality";
    limit?: number;
    autocomplete?: 1 | 0;
  } = {},
) => {
  try {
    if (filters.autocomplete === undefined) {
      filters.autocomplete = 1;
    }
    const filtersString = !filters || Object.keys(filters).length > 0 ? "" : `&${qs.stringify(filters)}`;
    const res = await fetch(`https://data.geopf.fr/geocodage/search/?q=${encodeURIComponent(queryString)}${filtersString}`, {
      // @ts-ignore
      retries: 3,
      retryDelay: 1000,
      retryOn: [502, 503, 504],
      headers: { "Content-Type": "application/json" },
      mode: "cors",
      method: "GET",
    });
    return await res.json();
  } catch (e) {
    logger.error(e);
    capture(e, { extra: { queryString } });
  }
};

export const getNearestLocation = async (city: string, zip: string) => {
  try {
    if (!city && !zip) return null;
    // try with municipality = city + zip
    const resMunicipality = await apiAdress(city + " " + zip, { type: "municipality" });
    if (resMunicipality?.features?.length > 0) {
      return {
        lon: resMunicipality.features[0].geometry.coordinates[0],
        lat: resMunicipality.features[0].geometry.coordinates[1],
      };
    }
    // try with locality = city + zip
    const resLocality = await apiAdress(zip + " " + city, { type: "locality" });
    if (resLocality?.features?.length > 0) {
      return {
        lon: resLocality.features[0].geometry.coordinates[0],
        lat: resLocality.features[0].geometry.coordinates[1],
      };
    }
    // try with postcode = zip
    const resPostcode = await apiAdress(`${city || zip}`, zip ? { postcode: zip } : {});
    if (resPostcode?.features?.length > 0) {
      return {
        lon: resPostcode.features[0].geometry.coordinates[0],
        lat: resPostcode.features[0].geometry.coordinates[1],
      };
    }
    return {
      lon: 2.352222,
      lat: 48.856613,
    };
  } catch (e) {
    capture(e);
    return null;
  }
};
