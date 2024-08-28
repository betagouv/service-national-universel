const { capture } = require("../../sentry");

const apiAdress = async (path, options = {}) => {
  try {
    const res = await fetch(`https://api-adresse.data.gouv.fr/search/?autocomplete=1&q=${path}`, {
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
    capture(e, { extra: { path: path } });
  }
};

const putLocation = async (city, zip) => {
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

module.exports = { apiAdress, putLocation };
