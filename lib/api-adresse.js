const api = async (path, options = {}) => {
  try {
    const res = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${path}`, {
      ...options,
      retries: 3,
      retryDelay: 1000,
      retryOn: [502, 503, 504],
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
      mode: "no-cors",
      method: "GET",
    });
    return await res.json();
  } catch (e) {
    console.log("Erreur in apiadress", e);
    capture(e);
  }
};

module.exports = {
  api,
};
