const fetch = require("node-fetch");
const environment = getEnvironment();
let SUPPORT_URL = process.env.SUPPORT_URL;

if (environment === "staging") {
  SUPPORT_URL = "https://app-e08e5b05-2416-486c-ad68-2d511fadbe50.cleverapps.io";
}
if (environment === "production") {
  SUPPORT_URL = "https://app-e08e5b05-2416-486c-ad68-2d511fadbe50.cleverapps.io";
}

const getCustomerIdByEmail = async (email) => {
  const res = await api(`/users/search?query=email:${email}&limit=1`, { method: "GET" });
  if (!res.length) return null;
  else return res[0]?.id;
};

const api = async (path, options = {}) => {
  if (!SUPPORT_URL) return { ok: true, code: "ignore zammood, no support url" };
  const res = await fetch(`${SUPPORT_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", apikey: process.env.SUPPORT_APIKEY, ...(options.headers || {}) },
  });
  const contentType = res.headers.raw()["content-type"];
  if (contentType && contentType.length && contentType[0].includes("application/json")) return await res.json();
  return await res.text();
};

// async function sync(doc, { force } = { force: false }) {
//   try {
//     if (!doc) return console.log("ERROR WITH ", doc.email);

//     if (ENVIRONMENT !== "production" && !force) return console.log("no sync zammad");
//     let role;
//     let note = "";
//     if (doc.role === "referent" || doc.role === "referent_department" || doc.role === "referent_region") {
//       role = ROLE.REFERENT;
//       note = `<a href=${`https://admin.snu.gouv.fr/user/${doc._id}`}>Profil référent</a><br/><br/><p><b>Rôle :</b> ${translate(doc.role)}</p><br/>${doc.subRole && `<p><b>Fonction :</b> ${translate(doc.subRole)}</p><br/>`
//         }${doc.role === "referent_department" && `<p><b>Département :</b> ${doc.department}</p>`}
//       ${doc.role === "referent_region" && `<p><b>Région :</b> ${doc.region}</p>`}`;
//     } else if (doc.role === "responsible" || doc.role === "supervisor") {
//       role = ROLE.STRUCTURE;
//       note = `<a href=${`https://admin.snu.gouv.fr/user/${doc._id}`}>Profil responsable</a>`;
//     } else if (doc.role === "visitor") {
//       role = ROLE.VISITOR;
//       note = `<a href=${`https://admin.snu.gouv.fr/user/${doc._id}`}>Profil visiteur</a>`;
//     } else if (doc.role === "admin") {
//       role = ROLE.ADMIN;
//     } else if (doc.role && !["referent_department", "referent_region", "responsible", "supervisor", "admin", "visitor"].includes(doc.role)) {
//       console.log("NO AUTHORIZED ROLE");
//       return;
//     } else if (!doc.role) {
//       role = ROLE.VOLONTAIRE;
//       note = `<a href=${`https://admin.snu.gouv.fr/volontaire/${doc._id}`}>Profil volontaire</a><br/><br/>
//       <p><b>Phase 1 :</b> ${translate(doc.statusPhase1)}</p><br/><p><b>Phase 2 :</b> ${translate(doc.statusPhase2)}</p><br/><p><b>Phase 3 :</b> ${translate(
//         doc.statusPhase3,
//       )}</p><br/><p><b>Cohorte :</b> ${doc.cohort}</p><br/><a href=${`https://admin.snu.gouv.fr/volontaire/${doc._id}/phase2`}>Candidatures</a>`;
//     }
//     const res = await api(`/users/search?query=email:${doc.email}&limit=1`, { method: "GET" });
//     if (!res?.length) {
//       //create a user
//       await api("/users", {
//         method: "POST",
//         body: JSON.stringify({
//           email: doc.email,
//           firstname: doc.firstName,
//           lastname: doc.lastName,
//           department: doc.department,
//           address: `${doc.zip} ${doc.city}`,
//           note,
//           role_ids: [role],
//         }),
//       });
//     } else {
//       //Update a user
//       await api(`/users/${res[0].id}`, {
//         method: "PUT",
//         body: JSON.stringify({
//           email: doc.email,
//           firstname: doc.firstName,
//           lastname: doc.lastName,
//           department: doc.department,
//           address: `${doc.zip} ${doc.city}`,
//           note,
//           role_ids: [role],
//         }),
//       });
//     }
//   } catch (e) {
//     capture(e);
//   }
// }

// async function unsync(obj) {
//   if (ENVIRONMENT !== "production") return;
//   try {
//     const res = await api(`/users/search?query=email:${obj.email}&limit=1`, { method: "GET" });
//     if (!res.length) return;
//     await api(`/users/${res[0].id}`, { method: "DELETE" });
//   } catch (e) {
//     capture(e);
//     console.log("Can't delete in zammad", obj.email);
//   }
// }

function getEnvironment() {
  if (process.env.STAGING === "true") return "staging";
  else if (process.env.PRODUCTION === "true") return "production";
  else if (process.env.TESTING === "true" || process.env.NODE_ENV === "test") return "testing";
  return "development";
}

module.exports = { api, getCustomerIdByEmail };
