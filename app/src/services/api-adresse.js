import { capture } from "../sentry";
// https://adresse.data.gouv.fr/api-doc/adresse
// Filtres possibles : postcode, citycode (INSEE), type, limit, autocomplete

const baseUrl = "https://api-adresse.data.gouv.fr/search/?";

const apiAdress = async (query, filters = [], options = {}) => {
  const url = encodeURI(`${baseUrl}q=${query}${filters.length > 0 ? `&${filters.join("&")}` : ""}`);

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
    capture(e);
  }
};

const putLocation = async (city, zip) => {
  try {
    if (!city && !zip) return;
    // try with municipality = city + zip
    const resMunicipality = await apiAdress(city, [`postcode=${zip}`, "type=municipality"]);
    if (resMunicipality?.features?.length > 0) {
      return {
        lon: resMunicipality.features[0].geometry.coordinates[0],
        lat: resMunicipality.features[0].geometry.coordinates[1],
      };
    }
    // try with locality = city + zip
    const resLocality = await apiAdress(city, [`postcode=${zip}`, "type=locality"]);
    if (resLocality?.features?.length > 0) {
      return {
        lon: resLocality.features[0].geometry.coordinates[0],
        lat: resLocality.features[0].geometry.coordinates[1],
      };
    }
    // try with postcode = zip
    let url = `${city || zip}`;
    const resPostcode = await apiAdress(url, [`postcode=${zip}`]);
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

export { apiAdress, putLocation };
