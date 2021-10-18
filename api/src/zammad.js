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

const getCustomerIdByEmail = async (email) => {
  const res = await api(`/users/search?query=email:${email}&limit=1`, { method: "GET" });
  if (!res.length) return null;
  else return res[0]?.id;
};

const api = async (path, options = {}) => {
  if (!ZAMMAD_TOKEN) return console.log("No token");
  const res = await fetch(`https://support.snu.gouv.fr/api/v1${path}`, {
    ...options,
    headers: { Authorization: `Token token=${ZAMMAD_TOKEN}`, "Content-Type": "application/json", ...(options.headers || {}) },
  });

  const contentType = res.headers.raw()["content-type"];
  if (contentType && contentType.length && contentType[0].includes("application/json")) return await res.json();
  return await res.text();
};

async function sync(doc, modelName) {
  try {
    if (ENVIRONMENT !== "production") return;
    let role;
    if (doc.role === "referent") {
      role = ROLE.REFERENT;
    } else if (doc.role === "responsible") {
      role = ROLE.STRUCTURE;
    } else {
      role = ROLE.VOLONTAIRE;
    }
    const res = await api(`/users/search?query=email:${doc.email}&limit=1`, { method: "GET" });
    if (!res.length) {
      //create a user
      await api("/users", {
        method: "POST",
        body: JSON.stringify({ email: doc.email, firstname: doc.firstName, lastname: doc.lastName, role_ids: [role] }),
      });
    } else {
      //Update a user
      await api(`/users/${res[0].id}`, {
        method: "PUT",
        body: JSON.stringify({ email: doc.email, firstname: doc.firstName, lastname: doc.lastName, role_ids: [role] }),
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

module.exports = { api, unsync, sync, ROLE, getCustomerIdByEmail };
