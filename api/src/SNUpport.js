const fetch = require("node-fetch");
const config = require("config");

const getCustomerIdByEmail = async (email) => {
  const res = await api(`/users/search?query=email:${email}&limit=1`, { method: "GET" });
  if (!res.length) return null;
  else return res[0]?.id;
};

const api = async (path, options = {}) => {
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
