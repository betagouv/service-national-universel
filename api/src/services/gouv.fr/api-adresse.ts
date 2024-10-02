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
    const res = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(queryString)}${filtersString}`, {
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

export const getSpecificAdressLocation = async ({ label, address, city, zip }: { label?: string; address?: string; city?: string; zip?: string }) => {
  if (!address || !city || !zip) {
    throw new Error("Missing address, city or zip");
  }
  // si l'adresse ne commence par un numéro (ex: gare de nantes) on ajoute son label, sinon le numéro de rue suffit
  const fullAddress = !label || address.match(/^[0-9].*/) ? `${address}, ${zip} ${city}` : `${label}, ${address}, ${city} ${zip}`;

  let { features } = await apiAdress(fullAddress, { autocomplete: 0 });
  if (!features?.length) {
    throw new Error(`No location found for this address ${fullAddress}`);
  }
  if (features.length !== 1) {
    const filteredFeatures = features?.filter(
      (feature) => normlizeName(address) === normlizeName(feature.properties.name) && normlizeName(city) === normlizeName(feature.properties.city),
    );
    if (filteredFeatures.length !== 1) {
      throw new Error(`Many locations (${features?.length}) found for this address ${fullAddress}`);
    }
    features = filteredFeatures;
  }

  return {
    lon: features[0].geometry.coordinates[0],
    lat: features[0].geometry.coordinates[1],
  };
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

const normlizeName = (value: string) => value.trim().toLowerCase().replaceAll(" ", "-");
