const ROLES = {
  ADMIN: "admin",
  REFERENT_DEPARTMENT: "referent_department",
  REFERENT_REGION: "referent_region",
  RESPONSIBLE: "responsible",
  SUPERVISOR: "supervisor",
  HEAD_CENTER: "head_center",
  STRUCTURE_RESPONSIBLE: "structure_responsible", // Is it legacy?
  STRUCTURE_MEMBER: "structure_member", // Is it legacy?
};

const SUB_ROLES = {
  manager_department: "manager_department",
  assistant_manager_department: "assistant_manager_department",
  manager_department_phase2: "manager_department_phase2",
  secretariat: "secretariat",
  coordinator: "coordinator",
  assisstant_coordinator: "assistant_coordinator",
  none: "",
};

const ROLES_LIST = Object.values(ROLES);
const SUB_ROLES_LIST = Object.values(SUB_ROLES);

function canInviteUser(actorRole, targetRole) {
  // Admins can invite any user
  if (actorRole === ROLES.ADMIN) return true;

  // REFERENT_DEPARTMENT can invite REFERENT_DEPARTMENT, RESPONSIBLE, SUPERVISOR, HEAD_CENTER
  if (actorRole === ROLES.REFERENT_DEPARTMENT) {
    return [
      ROLES.REFERENT_DEPARTMENT,
      ROLES.HEAD_CENTER,
      ROLES.RESPONSIBLE,
      ROLES.SUPERVISOR,
    ].includes(targetRole);
  }

  // REFERENT_REGION can invite REFERENT_DEPARTMENT, REFERENT_REGION, RESPONSIBLE, SUPERVISOR, HEAD_CENTER
  if (actorRole === ROLES.REFERENT_REGION) {
    return [
      ROLES.REFERENT_DEPARTMENT,
      ROLES.REFERENT_REGION,
      ROLES.HEAD_CENTER,
      ROLES.RESPONSIBLE,
      ROLES.SUPERVISOR,
    ].includes(targetRole);
  }

  // RESPONSIBLE and SUPERVISOR can invite only RESPONSIBLE and SUPERVISOR.
  if (actorRole === ROLES.RESPONSIBLE || actorRole === ROLES.SUPERVISOR) {
    return targetRole === ROLES.RESPONSIBLE || targetRole === ROLES.SUPERVISOR;
  }
}

module.exports = {
  ROLES,
  SUB_ROLES,
  ROLES_LIST,
  SUB_ROLES_LIST,
  canInviteUser,
};
