const YoungObject = require("../models/young");
const ReferentObject = require("../models/referent");
const zammood = require("../zammood");
const { capture } = require("../sentry");
const slack = require("../slack");
const { ROLES } = require("snu-lib/roles");
const { ADMIN_URL } = require("../config.js");
const { isYoung } = require("../utils");

exports.handler = async () => {
  try {
    const youngs = await YoungObject.find({ createdAt: { $gte: new Date(new Date() - 24 * 60 * 60 * 1000) } }).lean();
    const referents = await ReferentObject.find({ createdAt: { $gte: new Date(new Date() - 24 * 60 * 60 * 1000) } }).lean();
    const contacts = youngs.concat(referents);
    for (const contact of contacts) {
      contact.attributes = await getUserAttributes(contact);
    }
    const response = await zammood.api(`/v0/young`, { method: "POST", credentials: "include", body: JSON.stringify({ contacts }) });
    if (!response.ok) slack.error({ title: "Fail sync contacts (young + ref) to Zammood", text: JSON.stringify(response.code) });
  } catch (e) {
    capture(`ERROR`, JSON.stringify(e));
    capture(e);
  }
};

const getUserAttributes = async (user) => {
  try {
    const structureLink = `${ADMIN_URL}/structure/${user.structureId}`;
    const missionsLink = `${ADMIN_URL}/structure/${user.structureId}/missions`;
    // const centerLink = `${ADMIN_URL}/centre/${user.cohesionCenterId}`;
    const profilLink = isYoung(user) ? `${ADMIN_URL}/volontaire/${user._id}` : `${ADMIN_URL}/user/${user._id}`;
    const role = isYoung(user) ? "young" : user.role;
    const userAttributes = [
      { name: "date de création", value: user.createdAt },
      { name: "dernière connexion", value: user.lastLoginAt },
      { name: "lien vers profil", value: profilLink },
      { name: "departement", value: user.department },
      { name: "region", value: user.region },
      { name: "role", value: role },
    ];

    if (isYoung(user)) {
      userAttributes.push({ name: "cohorte", value: user.cohort });
      userAttributes.push({ name: "statut général", value: user.status });
      userAttributes.push({ name: "statut phase 1", value: user.statusPhase1 });
      userAttributes.push({ name: "statut phase 2", value: user.statusPhase2 });
      userAttributes.push({ name: "statut phase 3", value: user.statusPhase3 });
      userAttributes.push({ name: "lien vers candidatures", value: `${ADMIN_URL}/volontaire/${user._id}/phase2` });
      userAttributes.push({
        name: "lien vers équipe départementale",
        value: `${ADMIN_URL}/user?DEPARTMENT=%5B%22${user.department}%22%5D&ROLE=%5B%22referent_department%22%5D`,
      });
      userAttributes.push({ name: "classe", value: user.grade });
    } else {
      if (user.role === ROLES.RESPONSIBLE || user.role === ROLES.SUPERVISOR) {
        userAttributes.push({ name: "lien vers la fiche structure", value: structureLink });
        userAttributes.push({ name: "lien général vers la page des missions proposées par la structure", value: missionsLink });
      }
      if (user.role === ROLES.HEAD_CENTER) {
        userAttributes.push({ name: "lien vers le centre de cohésion", value: centerLink });
      }
      if (user.role === ROLES.REFERENT_DEPARTMENT || user.role === ROLES.REFERENT_REGION) {
        userAttributes.push({
          name: "lien vers équipe départementale",
          value: `${ADMIN_URL}/user?DEPARTMENT=%5B%22${user.department}%22%5D&ROLE=%5B%22referent_department%22%5D`,
        });
        if (user.subRole) userAttributes.push({ name: "fonction", value: user.subRole });
      }
      if (user.role === ROLES.REFERENT_DEPARTMENT) {
        userAttributes.push({
          name: "lien vers équipe régionale",
          value: `${ADMIN_URL}/user?REGION=%5B%22${user.region}%22%5D&ROLE=%5B%22referent_region%22%5D`,
        });
      }
    }
    return userAttributes;
  } catch (e) {
    console.log(e);
  }
};
