import { capture } from "../sentry";
import { departmentLookUp } from "snu-lib/region-and-departments";

// https://adresse.data.gouv.fr/api-doc/adresse
// Filtres possibles : postcode, citycode (INSEE), type, limit, autocomplete

const apiAdress = async (query, filters = {}, options = {}) => {
  let url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}`;

  for (const [key, value] of Object.entries(filters)) {
    url += `&${key}=${encodeURIComponent(value)}`;
  }

  try {
    const res = await fetch(url, {
      ...options,
      retries: 3,
      retryDelay: 1000,
      retryOn: [502, 503, 504],
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
      mode: "cors",
      method: "GET",
    });
    return await res.json();
  } catch (e) {
    capture(e, { extra: { url: url } });
  }
};

const putLocation = async (city, zip) => {
  try {
    if (!city && !zip) return;
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
    console.log("Erreur in putLocation", e);
    capture(e);
  }
};

function formatOption(option) {
  const { department, region } = getDepartmentAndRegionFromContext(option.properties.context);
  return {
    addressVerified: "true",
    address: option.properties.type !== "municipality" ? option.properties.name : "",
    coordinatesAccuracyLevel: option.properties.type,
    zip: option.properties.postcode,
    city: option.properties.city,
    cityCode: option.properties.citycode,
    department,
    region,
    location: { lat: option.geometry.coordinates[1], lon: option.geometry.coordinates[0] },
  };
}

function getDepartmentAndRegionFromContext(context) {
  // Context has the department number as first element, department name as an optional second element and region as the last element.
  // Examples:
  // ['50', ' Manche', ' Normandie']
  // ['988', ' Nouvelle-Calédonie']
  const arr = context.split(",");
  const departmentNumber = arr[0].trim();
  const department = departmentLookUp[departmentNumber];
  const region = arr[arr.length - 1].trim();
  return { department, region };
}

async function getAddressOptions(query, signal) {
  // Call BAN API
  const res = await apiAdress(query, { limit: 10 }, { signal });
  if (!res) return [[], null];
  if (res.error) return [null, res.error];
  if (!res.features?.length) return [[], null];

  // Format and group options
  const formattedOptions = res.features.map((option) => formatOption(option));

  const housenumbers = formattedOptions.filter((option) => option.coordinatesAccuracyLevel === "housenumber");
  const streets = formattedOptions.filter((option) => option.coordinatesAccuracyLevel === "street");
  const localities = formattedOptions.filter((option) => option.coordinatesAccuracyLevel === "locality");
  const municipalities = formattedOptions.filter((option) => option.coordinatesAccuracyLevel === "municipality");

  const options = [];
  if (housenumbers.length > 0) options.push({ label: "Numéro", options: housenumbers });
  if (streets.length > 0) options.push({ label: "Voie", options: streets });
  if (localities.length > 0) options.push({ label: "Lieu-dit", options: localities });
  if (municipalities.length > 0) options.push({ label: "Commune", options: municipalities });

  return [options, null];
}

export { apiAdress, putLocation, getAddressOptions };
