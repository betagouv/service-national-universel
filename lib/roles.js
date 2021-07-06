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
function canDelete(actor, target) {
  if (actor.role === ROLES.ADMIN) return true;
  // https://trello.com/c/Wv2TrQnQ/383-admin-ajouter-onglet-utilisateurs-pour-les-r%C3%A9f%C3%A9rents
  if (actor.role === ROLES.REFERENT_REGION) {
    return (
      ([ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(
        target.role
      ) &&
        actor.region === target.region) ||
      [ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(target.role)
    );
  }
  if (actor.role === ROLES.REFERENT_DEPARTMENT) {
    return (
      (actor.role === target.role && actor.department === target.department) ||
      [ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(target.role)
    );
  }
  return false;
}

function canViewPatchesHistory(actor) {
  return actor.role === "admin";
}

function canViewReferent(actor, target) {
  const isAdminOrReferent = [
    ROLES.ADMIN,
    ROLES.REFERENT_DEPARTMENT,
    ROLES.REFERENT_REGION,
  ].includes(actor.role);
  const isResponsibleModifyingResponsible =
    [ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(actor.role) &&
    [ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(target.role);
  // See: https://trello.com/c/Wv2TrQnQ/383-admin-ajouter-onglet-utilisateurs-pour-les-r%C3%A9f%C3%A9rents
  return isAdminOrReferent || isResponsibleModifyingResponsible;
}

module.exports = {
  ROLES,
  SUB_ROLES,
  ROLES_LIST,
  SUB_ROLES_LIST,
  canInviteUser,
  canDelete,
  canViewPatchesHistory,
  canViewReferent,
};
