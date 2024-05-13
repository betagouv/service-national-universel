const StructureObject = require("../models/structure");
const ReferentObject = require("../models/referent");
const { ROLES } = require("snu-lib");
const { ADMIN_URL } = require("../config");
const { isYoung } = require("../utils");

const getUserAttributes = async (user) => {
  const structureLink = `${ADMIN_URL}/structure/${user.structureId}`;
  const missionsLink = `${ADMIN_URL}/structure/${user.structureId}/missions`;
  const centerLink = `${ADMIN_URL}/centre/${user.cohesionCenterId}`;

  const profilLink = isYoung(user) ? `${ADMIN_URL}/volontaire/${user._id}` : `${ADMIN_URL}/user/${user._id}`;
  const role = isYoung(user) ? "young" : user.role;
  let userAttributes = [
    { name: "date de création", value: user.createdAt },
    { name: "dernière connexion", value: user.lastLoginAt },
    { name: "lien vers profil", value: profilLink },
    { name: "departement", value: user.department },
    { name: "region", value: user.region },
    { name: "role", value: role },
  ];

  if (isYoung(user)) {
    // @todo : departmentReferentPhase2Link can be given to all users but extra logic is needed: for referents departement is an array and for supervisors and responsible it should be retrieved via the structure
    const departmentReferentPhase2 = await ReferentObject.findOne({
      department: user.department,
      subRole: { $in: ["manager_department_phase2", "manager_phase2"] },
    });
    let departmentReferentPhase2Link = "";
    if (departmentReferentPhase2) departmentReferentPhase2Link = `${ADMIN_URL}/user/${departmentReferentPhase2._id}`;
    userAttributes.push({ name: "cohorte", value: user.cohort });
    userAttributes.push({ name: "statut général", value: user.status });
    userAttributes.push({ name: "statut phase 1", value: user.statusPhase1 });
    userAttributes.push({ name: "statut phase 2", value: user.statusPhase2 });
    userAttributes.push({ name: "statut phase 3", value: user.statusPhase3 });
    if (departmentReferentPhase2) userAttributes.push({ name: "lien vers référent phase 2", value: departmentReferentPhase2Link });
    userAttributes.push({ name: "lien vers candidatures", value: `${ADMIN_URL}/volontaire/${user._id}/phase2` });
    userAttributes.push({
      name: "lien vers équipe départementale",
      value: `${ADMIN_URL}/user?department=${user.department}&role=referent_department`,
    });
    userAttributes.push({ name: "classe", value: user.grade });
  } else {
    if (user.role === ROLES.RESPONSIBLE || user.role === ROLES.SUPERVISOR) {
      userAttributes.push({ name: "lien vers la fiche structure", value: structureLink });
      userAttributes.push({ name: "lien général vers la page des missions proposées par la structure", value: missionsLink });
      if (user.structureId) {
        const structure = await StructureObject.findById(user.structureId).lean();
        userAttributes = userAttributes.map((a) => {
          if (a.name === "departement") {
            return { name: "departement", value: structure?.department };
          }
          return a;
        });
        userAttributes = userAttributes.map((a) => {
          if (a.name === "region") {
            return { name: "region", value: structure?.region };
          }
          return a;
        });
      }
    }
    if (user.role === ROLES.HEAD_CENTER) {
      userAttributes.push({ name: "lien vers le centre de cohésion", value: centerLink });
    }
    if (user.role === ROLES.REFERENT_DEPARTMENT || user.role === ROLES.REFERENT_REGION) {
      userAttributes.push({
        name: "lien vers équipe départementale",
        value: `${ADMIN_URL}/user?department=${user.department.join("~")}&role=referent_department`,
      });
      if (user.subRole) userAttributes.push({ name: "fonction", value: user.subRole });
    }
    if (user.role === ROLES.REFERENT_REGION) {
      userAttributes.push({
        name: "lien vers équipe régionale",
        value: `${ADMIN_URL}/user?region=${user.region}&role=referent_region`,
      });
    }
  }
  return userAttributes;
};

module.exports = { getUserAttributes };
