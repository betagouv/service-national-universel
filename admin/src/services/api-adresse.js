import { capture } from "../sentry";

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

export { apiAdress, putLocation };
