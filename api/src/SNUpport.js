const fetch = require("node-fetch");
const { config } = require("./config");

const getCustomerIdByEmail = async (email) => {
  const res = await api(`/users/search?query=email:${encodeURIComponent(email)}&limit=1`, { method: "GET" });
  if (!res.length) return null;
  else return res[0]?.id;
};

// Défense en profondeur : cet appel porte l'apikey de confiance, aucun chemin ne doit pouvoir
// sortir de la route visée (remontée "..", troncature par "#") sous l'effet d'un paramètre utilisateur.
const assertSafePath = (path) => {
  if (typeof path !== "string" || !path.startsWith("/") || path.includes("..") || path.includes("#") || path.includes("\\")) {
    throw new Error(`SNUpport.api: chemin invalide (${path})`);
  }
};

const api = async (path, options = {}) => {
  assertSafePath(path);
  if (!config.SUPPORT_URL) return { ok: true, code: "ignore SNUpport, no support url" };
  const res = await fetch(`${config.SUPPORT_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", apikey: config.SUPPORT_APIKEY, ...(options.headers || {}) },
  });
  const contentType = res.headers.raw()["content-type"];
  if (contentType && contentType.length && contentType[0].includes("application/json")) return await res.json();
  return await res.text();
};

module.exports = { api, getCustomerIdByEmail };
