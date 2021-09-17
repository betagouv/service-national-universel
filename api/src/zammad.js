const fetch = require("node-fetch");

//https://docs.zammad.org/en/latest/api/intro.html

const { ZAMMAD_TOKEN, ENVIRONMENT } = require("./config");
const { capture } = require("./sentry");

const ROLE = {
  ADMIN: 1,
  AGENT: 2,
  CUSTOMER: 3,
  VOLONTAIRE: 4, // volontaire
  REFERENT: 5, // referent
  STRUCTURE: 6,
};

const ORGANISATION = {
  STARTUP: 1,
  SOUSDIRECTION: 2,
};

const api = async (path, options = {}) => {
  if (!ZAMMAD_TOKEN) return console.log("No token");
  const res = await fetch(`https://support.selego.co/api/v1${path}`, {
    ...options,
    headers: { Authorization: `Token token=${ZAMMAD_TOKEN}`, "Content-Type": "application/json", ...(options.headers || {}) },
  });
  const contentType = res.headers.raw()["content-type"];
  if (contentType && contentType.length && contentType[0].includes("application/json")) return await res.json();
  return await res.text();
};

async function sync(obj, type) {
  try {
    if (ENVIRONMENT !== "production") return;
    const role = type === "referent" ? ROLE.REFERENT : ROLE.VOLONTAIRE;
    const res = await api(`/users/search?query=email:${obj.email}&limit=1`, { method: "GET" });
    console.log("res", res);
    if (!res.length) {
      //create a user
      await api("/users", {
        method: "POST",
        body: JSON.stringify({ email: obj.email, firstname: obj.firstName, lastname: obj.lastName, role_ids: [role] }),
      });
    } else {
      await api(`/users/${res[0].id}`, {
        method: "PUT",
        body: JSON.stringify({ email: obj.email, firstname: obj.firstName, lastname: obj.lastName, role_ids: [role] }),
      });
    }
  } catch (e) {
    capture(e);
  }
}

async function unsync(obj) {
  if (ENVIRONMENT !== "production") return;
  try {
    const res = await api(`/users/search?query=email:${obj.email}&limit=1`, { method: "GET" });
    if (!res.length) return;
    await api(`/users/${res[0].id}`, { method: "DELETE" });
  } catch (e) {
    capture(e);
    console.log("Can't delete in zammad", obj.email);
  }
}

module.exports = { api, unsync, sync };
