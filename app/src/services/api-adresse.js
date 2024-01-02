import { capture } from "../sentry";
import { department2region, departmentLookUp } from "snu-lib/region-and-departments";

// https://adresse.data.gouv.fr/api-doc/adresse
// Filtres possibles : postcode, citycode (INSEE), type, limit, autocomplete
// Types de résultats :
//   housenumber : numéro « à la plaque »
//   street : position « à la voie », placé approximativement au centre de celle-ci
//   locality : lieu-dit
//   municipality : numéro « à la commune »

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
    if (e.name !== "AbortError") capture(e, { extra: { url: url } });
  }
};

const simpleApiAdress = async (query, filters = {}) => {
  let url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}`;
  for (const [key, value] of Object.entries(filters)) {
    url += `&${key}=${encodeURIComponent(value)}`;
  }
  const res = await fetch(url);
  const json = await res.json();
  if (json.error) throw new Error(json.error);
  return json;
};

const putLocation = async (query, postcode, signal) => {
  if (!postcode) {
    capture(new Error("No postcode"), { extra: { query: query } });
    return null;
  }
  let res = await apiAdress(query, { postcode }, { signal });
  if (res?.features?.length) {
    return { lat: res?.features[0]?.geometry?.coordinates[1], lon: res?.features[0]?.geometry?.coordinates[0] };
  }
  // if no result, try with zip code only
  res = await apiAdress(postcode, { postcode }, { signal });
  if (res?.features?.length) {
    return { lat: res?.features[0]?.geometry?.coordinates[1], lon: res?.features[0]?.geometry?.coordinates[0] };
  }
  return null;
};

const getSuggestions = async (address, city, zip) => {
  try {
    let res = await apiAdress(`${address}, ${city}, ${zip}`, { postcode: zip });

    // Si pas de résultat, on tente avec la ville et le code postal uniquement
    if (res?.features?.length === 0) {
      res = await apiAdress(`${city}, ${zip}`, { postcode: zip });
    }

    const arr = res?.features;

    if (arr?.length > 0) return { ok: true, status: "FOUND", ...arr[0] };
    else return { ok: false, status: "NOT_FOUND" };
  } catch (e) {
    return { ok: false, status: "NOT_FOUND" };
  }
};

const formatResult = (suggestion) => {
  let depart = suggestion.properties.postcode.substr(0, 2);

  // Cas particuliers : codes postaux en Polynésie
  if (["97", "98"].includes(depart)) {
    depart = suggestion.properties.postcode.substr(0, 3);
  }

  // Cas particuliers : code postaux en Corse
  if (depart === "20") {
    depart = suggestion.properties.context.substr(0, 2);
    if (!["2A", "2B"].includes(depart)) depart = "2B";
  }

  return {
    address: suggestion.properties.name,
    zip: suggestion.properties.postcode,
    city: suggestion.properties.city,
    department: departmentLookUp[depart],
    departmentNumber: depart,
    location: { lon: suggestion.geometry.coordinates[0], lat: suggestion.geometry.coordinates[1] },
    region: department2region[departmentLookUp[depart]],
    cityCode: suggestion.properties.citycode,
  };
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

function sortOptions(options) {
  const housenumbers = options.filter((option) => option.coordinatesAccuracyLevel === "housenumber");
  const streets = options.filter((option) => option.coordinatesAccuracyLevel === "street");
  const localities = options.filter((option) => option.coordinatesAccuracyLevel === "locality");
  const municipalities = options.filter((option) => option.coordinatesAccuracyLevel === "municipality");

  const sortedOptions = [];
  if (housenumbers.length > 0) sortedOptions.push({ label: "Numéro", options: housenumbers });
  if (streets.length > 0) sortedOptions.push({ label: "Voie", options: streets });
  if (localities.length > 0) sortedOptions.push({ label: "Lieu-dit", options: localities });
  if (municipalities.length > 0) sortedOptions.push({ label: "Commune", options: municipalities });

  return sortedOptions;
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

export { apiAdress, simpleApiAdress, putLocation, getSuggestions, formatResult, formatOption, sortOptions };
