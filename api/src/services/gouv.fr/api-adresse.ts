import qs from "query-string";
import { capture } from "../../sentry";

// https://adresse.data.gouv.fr/api-doc/adresse
export const apiAdress = async (
  queryString: string,
  autocomplete: boolean = true,
  options: {
    headers?: { [key: string]: string };
    retries?: number;
    retryDelay?: number;
    retryOn?: number[];
  } = {},
) => {
  try {
    const res = await fetch(`https://api-adresse.data.gouv.fr/search/?autocomplete=${autocomplete ? 1 : 0}&q=${queryString}`, {
      ...options,
      // @ts-ignore
      retries: 3,
      retryDelay: 1000,
      retryOn: [502, 503, 504],
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
      mode: "cors",
      method: "GET",
    });
    return await res.json();
  } catch (e) {
    capture(e, { extra: { queryString } });
  }
};

export const getUniqueAdressLocation = async ({ label, address, city, zip }: { label?: string; address: string; city: string; zip: string }) => {
  // si l'adresse ne commence par un numéro (ex: gare de nantes) on ajoute son label, sinon le numéro de rue suffit
  const fullAddress = !label || address.match(/^[0-9].*/) ? `${address}, ${zip} ${city}` : `${label}, ${address}, ${city} ${zip}`;

  let { features } = await apiAdress(encodeURIComponent(fullAddress), false);
  if (!features?.length) {
    throw new Error(`No location found for this address ${fullAddress}`);
  }
  if (features.length !== 1) {
    const filteredFeatures = features?.filter(
      (feature) => normlizeName(address) === normlizeName(feature.properties.name) || (label && normlizeName(JSON.stringify(feature.properties.name)).includes(label)),
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

export const putLocation = async (city: string, zip: string) => {
  try {
    if (!city && !zip) return;
    // try with municipality = city + zip
    const resMunicipality = await apiAdress(`${encodeURIComponent(city + " " + zip)}&type=municipality`);
    if (resMunicipality?.features?.length > 0) {
      return {
        lon: resMunicipality.features[0].geometry.coordinates[0],
        lat: resMunicipality.features[0].geometry.coordinates[1],
      };
    }
    // try with locality = city + zip
    const resLocality = await apiAdress(`${encodeURIComponent(zip + " " + city)}&type=locality`);
    if (resLocality?.features?.length > 0) {
      return {
        lon: resLocality.features[0].geometry.coordinates[0],
        lat: resLocality.features[0].geometry.coordinates[1],
      };
    }
    // try with postcode = zip
    let url = `${city || zip}`;
    if (zip) url += `&postcode=${zip}`;
    const resPostcode = await apiAdress(url);
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
  }
};

const normlizeName = (value: string) => value.trim().toLowerCase().replaceAll(" ", "-");
