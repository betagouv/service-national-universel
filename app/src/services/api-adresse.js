import { capture } from "../sentry";
import { department2region, departmentLookUp } from "snu-lib/region-and-departments";

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
    const resMunicipality = await apiAdress(city, { postcode: zip, type: "municipality" });
    if (resMunicipality?.features?.length > 0) {
      return {
        lon: resMunicipality.features[0].geometry.coordinates[0],
        lat: resMunicipality.features[0].geometry.coordinates[1],
      };
    }
    // try with locality = city + zip
    const resLocality = await apiAdress(city, { postcode: zip, type: "locality" });
    if (resLocality?.features?.length > 0) {
      return {
        lon: resLocality.features[0].geometry.coordinates[0],
        lat: resLocality.features[0].geometry.coordinates[1],
      };
    }
    // try with postcode = zip
    const resPostcode = await apiAdress(city || zip, { postcode: zip });
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

export { apiAdress, putLocation, getSuggestions, formatResult };
