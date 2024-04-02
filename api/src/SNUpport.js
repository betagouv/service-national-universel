const fetch = require("node-fetch");
const { SUPPORT_URL } = require("./config");

const getCustomerIdByEmail = async (email) => {
  const res = await api(`/users/search?query=email:${email}&limit=1`, { method: "GET" });
  if (!res.length) return null;
  else return res[0]?.id;
};

const api = async (path, options = {}) => {
  if (!SUPPORT_URL) return { ok: true, code: "ignore SNUpport, no support url" };
  const res = await fetch(`${SUPPORT_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", apikey: process.env.SUPPORT_APIKEY, ...(options.headers || {}) },
  });
  const contentType = res.headers.raw()["content-type"];
  if (contentType && contentType.length && contentType[0].includes("application/json")) return await res.json();
  return await res.text();
};

function getEnvironment() {
  if (process.env.STAGING === "true") return "staging";
  else if (process.env.PRODUCTION === "true") return "production";
  else if (process.env.TESTING === "true" || process.env.NODE_ENV === "test") return "testing";
  return "development";
}

module.exports = { api, getCustomerIdByEmail };
